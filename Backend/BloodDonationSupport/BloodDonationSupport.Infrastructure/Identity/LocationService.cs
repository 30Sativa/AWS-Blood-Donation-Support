using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Addresses.DTOs;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _context;
        private readonly string _placeIndexName;
        private readonly string _routeCalculatorName;
        private readonly IAmazonLocationService _locationClient;

        public LocationService(
            AppDbContext context,
            IConfiguration configuration,
            IAmazonLocationService locationClient)
        {
            _context = context;

            _placeIndexName = configuration["AWS:LocationPlaceIndexName"]
                ?? throw new Exception("Missing AWS Location Place Index name");

            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                ?? throw new Exception("Missing AWS Location Route Calculator name");

            _locationClient = locationClient;
        }

        // ============================================================
        // 🔵 CLEAN INPUT (chặn user nhập bậy)
        // ============================================================
        private string CleanRawAddress(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "";

            // Giữ lại chữ cái, số, dấu tiếng Việt, khoảng trắng, dấu phẩy
            string cleaned = Regex.Replace(
                input,
                @"[^0-9a-zA-ZÀ-ỹ\s,./\-]",
                ""
            );

            cleaned = cleaned.Trim();
            cleaned = Regex.Replace(cleaned, @"\s{2,}", " "); // remove double spaces

            return cleaned;
        }

        private bool LooksLikeGibberish(string input)
        {
            // "aaaaaa", "zzzzzz", "111111"
            return Regex.IsMatch(input, @"^(.)\1{4,}$");
        }

        private bool IsTooShort(string input)
        {
            return input.Length < 4;
        }

        // ============================================================
        // 🔵 PARSE ADDRESS (AWS GEOCODING)
        // ============================================================
        public async Task<ParsedAddressResult?> ParseAddressAsync(string fullAddress)
        {
            // 1) Clean input
            fullAddress = CleanRawAddress(fullAddress);

            if (string.IsNullOrWhiteSpace(fullAddress))
                return null;

            if (IsTooShort(fullAddress))
                return null;

            if (LooksLikeGibberish(fullAddress))
                return null;

            // 2) Call AWS
            var request = new SearchPlaceIndexForTextRequest
            {
                IndexName = _placeIndexName,
                Text = fullAddress,
                MaxResults = 1
            };

            var response = await _locationClient.SearchPlaceIndexForTextAsync(request);

            if (response.Results == null || response.Results.Count == 0)
                return null;

            var result = response.Results[0];

            // 3) Check relevance
            if (result.Relevance < 0.55)
                return null;

            var place = result.Place;

            if (place.Geometry?.Point == null || place.Geometry.Point.Count < 2)
                return null;

            double latitude = place.Geometry.Point[1];
            double longitude = place.Geometry.Point[0];

            string label = place.Label ?? fullAddress;

            // 4) Auto split components
            var parts = label.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

            string line1 = parts.ElementAtOrDefault(0) ?? fullAddress;
            string district = parts.ElementAtOrDefault(1) ?? "";
            string city = parts.ElementAtOrDefault(2) ?? "";
            string province = parts.ElementAtOrDefault(3) ?? "";
            string country = parts.LastOrDefault() ?? "Vietnam";

            if (parts.Length < 2)
                return null; // address quá mơ hồ

            return new ParsedAddressResult
            {
                Line1 = line1,
                District = district,
                City = city,
                Province = province,
                Country = country,
                PostalCode = "",

                NormalizedAddress = label,
                PlaceId = null, // AWS SDK v4 không có
                ConfidenceScore = result.Relevance,

                Latitude = latitude,
                Longitude = longitude
            };
        }

        // ============================================================
        // 🔵 GET NEARBY DONORS
        // ============================================================
        public async Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude,
            double longitude,
            double radiusKm)
        {
            var donors = await _context.Donors
                .Include(d => d.User).ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.Address)
                .Where(d => d.IsReady && d.Latitude != null && d.Longitude != null)
                .Select(d => new
                {
                    d.DonorId,
                    FullName = d.User.UserProfile.FullName,
                    BloodGroup = d.BloodType != null
                        ? $"{d.BloodType.Abo} {d.BloodType.Rh}"
                        : "Unknown",
                    AddressDisplay = d.Address != null
                        ? $"{d.Address.Line1}, {d.Address.District}, {d.Address.City}"
                        : "Chưa có địa chỉ",
                    d.NextEligibleDate,
                    d.Latitude,
                    d.Longitude
                })
                .ToListAsync();

            if (!donors.Any())
                return new List<NearbyDonorResponse>();

            // Haversine filter (AWS limit 400km)
            const double awsMaxKm = 400.0;

            double ToRad(double deg) => deg * Math.PI / 180.0;

            double Haversine(double lat1, double lon1, double lat2, double lon2)
            {
                var dLat = ToRad(lat2 - lat1);
                var dLon = ToRad(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLon / 2)
                        + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                        * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                return 6371.0 * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
            }

            var prefiltered = donors
                .Where(d => Haversine(latitude, longitude, d.Latitude ?? 0, d.Longitude ?? 0) <= awsMaxKm)
                .ToList();

            if (!prefiltered.Any())
                return new List<NearbyDonorResponse>();

            // AWS route matrix request
            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
                {
                    new List<double> { longitude, latitude }
                },
                DestinationPositions = prefiltered
                    .Select(d => new List<double> { d.Longitude ?? 0, d.Latitude ?? 0 })
                    .ToList()
            };

            var resp = await _locationClient.CalculateRouteMatrixAsync(req);

            var final = new List<NearbyDonorResponse>();

            for (int i = 0; i < resp.RouteMatrix.Count; i++)
            {
                var cell = resp.RouteMatrix[i][0];
                if (cell?.Distance == null) continue;

                var km = cell.Distance.Value / 1000.0;

                if (km <= radiusKm)
                {
                    var d = prefiltered[i];
                    final.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.FullName,
                        BloodGroup = d.BloodGroup,
                        AddressDisplay = d.AddressDisplay,
                        NextEligibleDate = d.NextEligibleDate,
                        Latitude = d.Latitude,
                        Longitude = d.Longitude,
                        DistanceKm = km,
                        IsReady = true
                    });
                }
            }

            return final.OrderBy(x => x.DistanceKm).ToList();
        }

        // ============================================================
        // 🔵 GET NEARBY REQUESTS
        // ============================================================
        public async Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(
            double latitude,
            double longitude,
            double radiusKm)
        {
            var requests = await _context.Requests
                .Include(r => r.RequesterUser).ThenInclude(u => u.UserProfile)
                .Include(r => r.BloodType)
                .Include(r => r.Component)
                .Where(r => r.Status == "REQUESTED" &&
                            r.Latitude != null &&
                            r.Longitude != null)
                .ToListAsync();

            if (!requests.Any())
                return new List<NearbyRequestResponse>();

            double ToRad(double deg) => deg * Math.PI / 180.0;
            double Haversine(double lat1, double lon1, double lat2, double lon2)
            {
                var dLat = ToRad(lat2 - lat1);
                var dLon = ToRad(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                        + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                        * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                return 6371.0 * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
            }

            return requests
                .Select(r => new NearbyRequestResponse
                {
                    RequestId = r.RequestId,
                    FullName = r.RequesterUser.UserProfile.FullName,
                    BloodGroup = $"{r.BloodType.Abo} {r.BloodType.Rh}",
                    ComponentName = r.Component.ComponentName,
                    AddressDisplay = $"{r.Latitude}, {r.Longitude}",
                    Status = r.Status,
                    Urgency = r.Urgency.ToString(),
                    QuantityUnits = r.QuantityUnits,
                    NeedBeforeUtc = r.NeedBeforeUtc,
                    CreatedAt = r.CreatedAt,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    DistanceKm = Haversine(latitude, longitude, r.Latitude ?? 0, r.Longitude ?? 0)
                })
                .Where(x => x.DistanceKm <= radiusKm)
                .OrderBy(x => x.DistanceKm)
                .ToList();
        }
    }
}
