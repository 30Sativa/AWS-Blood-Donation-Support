using Amazon;
using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Addresses.DTOs;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _context;
        private readonly string _region;
        private readonly string _routeCalculatorName;
        private readonly string _placeIndexName;
        private readonly IAmazonLocationService _locationClient;

        public LocationService(
            AppDbContext context,
            IConfiguration configuration,
            IAmazonLocationService locationClient)
        {
            _context = context;

            _region = configuration["AWS:Region"] ?? "ap-southeast-2";
            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                      ?? throw new Exception("Missing AWS Location Route Calculator name");

            _placeIndexName = configuration["AWS:LocationPlaceIndexName"]
                      ?? throw new Exception("Missing AWS Location Place Index name");

            _locationClient = locationClient;
        }


        // ============================================================
        //  🔵 STEP 4: PARSE ADDRESS (AWS GEOCODING)
        // ============================================================
        public async Task<ParsedAddressResult?> ParseAddressAsync(string fullAddress)
        {
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
            var place = result.Place;

            // AWS Geometry: [lng, lat]
            double latitude = place.Geometry.Point[1];
            double longitude = place.Geometry.Point[0];

            // Label = full normalized address
            string label = place.Label ?? fullAddress;

            // ============================================
            // TỰ TÁCH address components từ Label
            // Example Label: "12 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh, Vietnam"
            // ============================================

            var parts = label.Split(',', StringSplitOptions.TrimEntries);

            string line1 = parts.Length > 0 ? parts[0] : label;
            string district = parts.Length > 1 ? parts[1] : "";
            string city = parts.Length > 2 ? parts[2] : "";
            string province = parts.Length > 3 ? parts[3] : "";
            string country = parts.Length > 4 ? parts[4] : "Vietnam";

            return new ParsedAddressResult
            {
                Line1 = line1,
                District = district,
                City = city,
                Province = province,
                Country = country,
                PostalCode = "",

                NormalizedAddress = label,
                PlaceId = null,                 // SDK v4 không có
                ConfidenceScore = result.Relevance,

                Latitude = latitude,
                Longitude = longitude
            };
        }





        // ============================================================
        //  🔵 GET NEARBY DONORS
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

            // Prefilter for AWS 400km limit
            const double awsMaxKm = 400.0;
            double ToRadians(double deg) => deg * Math.PI / 180.0;

            double HaversineKm(double lat1, double lon1, double lat2, double lon2)
            {
                const double R = 6371.0;
                var dLat = ToRadians(lat2 - lat1);
                var dLon = ToRadians(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                         Math.Cos(ToRadians(lat1)) *
                         Math.Cos(ToRadians(lat2)) *
                         Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                return R * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
            }

            var prefiltered = donors
                .Select(d => new
                {
                    Donor = d,
                    ApproxKm = HaversineKm(latitude, longitude, d.Latitude ?? 0, d.Longitude ?? 0)
                })
                .Where(x => x.ApproxKm <= awsMaxKm)
                .Select(x => x.Donor)
                .ToList();

            if (!prefiltered.Any())
                return new List<NearbyDonorResponse>();

            // AWS Route Matrix Request
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

            var results = new List<NearbyDonorResponse>();

            for (int i = 0; i < resp.RouteMatrix.Count; i++)
            {
                var cell = resp.RouteMatrix[i][0];
                if (cell?.Distance == null)
                    continue;

                var distanceKm = cell.Distance.Value / 1000.0;

                if (distanceKm <= radiusKm)
                {
                    var d = prefiltered[i];
                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.FullName,
                        BloodGroup = d.BloodGroup,
                        AddressDisplay = d.AddressDisplay,
                        NextEligibleDate = d.NextEligibleDate,
                        Latitude = d.Latitude,
                        Longitude = d.Longitude,
                        DistanceKm = distanceKm,
                        IsReady = true
                    });
                }
            }

            return results.OrderBy(x => x.DistanceKm).ToList();
        }


        // ============================================================
        //  🔵 GET NEARBY REQUESTS
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

            double ToRadians(double deg) => deg * Math.PI / 180.0;
            double Haversine(double lat1, double lon1, double lat2, double lon2)
            {
                const double R = 6371;
                var dLat = ToRadians(lat2 - lat1);
                var dLon = ToRadians(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(ToRadians(lat1)) *
                        Math.Cos(ToRadians(lat2)) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
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
