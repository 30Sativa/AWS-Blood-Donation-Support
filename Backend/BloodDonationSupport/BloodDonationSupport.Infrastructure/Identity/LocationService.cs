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
        private readonly IAmazonLocationService _locationClient;

        private readonly string _region;
        private readonly string _routeCalculatorName;
        private readonly string _placeIndexName;

        private const double AWS_LIMIT_KM = 400.0;

        public LocationService(
            AppDbContext context,
            IConfiguration configuration,
            IAmazonLocationService locationClient)
        {
            _context = context;
            _locationClient = locationClient;

            _region = configuration["AWS:Region"] ?? "ap-southeast-2";

            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                ?? throw new Exception("Missing AWS Location Route Calculator name");

            _placeIndexName = configuration["AWS:LocationPlaceIndexName"]
                ?? throw new Exception("Missing AWS Location Place Index name");
        }

        // ============================================================
        //  PARSE ADDRESS (AWS GEOCODING)
        // ============================================================
        public async Task<ParsedAddressResult?> ParseAddressAsync(string fullAddress)
        {
            if (string.IsNullOrWhiteSpace(fullAddress))
                return null;

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

            if (place.Geometry?.Point == null || place.Geometry.Point.Count != 2)
                return null;

            double latitude = place.Geometry.Point[1];
            double longitude = place.Geometry.Point[0];

            string label = place.Label ?? fullAddress;

            var parts = label.Split(',', StringSplitOptions.TrimEntries);

            return new ParsedAddressResult
            {
                Line1 = parts.Length > 0 ? parts[0] : label,
                District = parts.Length > 1 ? parts[1] : "",
                City = parts.Length > 2 ? parts[2] : "",
                Province = parts.Length > 3 ? parts[3] : "",
                Country = parts.Length > 4 ? parts[4] : "Vietnam",
                PostalCode = "",
                NormalizedAddress = label,
                PlaceId = null,
                ConfidenceScore = result.Relevance,
                Latitude = latitude,
                Longitude = longitude
            };
        }

        // ============================================================
        //  GET NEARBY DONORS — FIXED WITH 400KM PREFILTER
        // ============================================================
        public async Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude,
            double longitude,
            double radiusKm)
        {
            // Validate input
            if (!IsValidLatLon(latitude, longitude))
                return new List<NearbyDonorResponse>();

            var donors = await _context.Donors
                .Include(d => d.User).ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.Address)
                .Where(d => d.IsReady && d.Latitude != null && d.Longitude != null)
                .ToListAsync();

            if (!donors.Any())
                return new List<NearbyDonorResponse>();

            // PREFILTER (avoid AWS >400km error)
            var prefiltered = donors
                .Where(d => d.Latitude != null && d.Longitude != null)
                .Where(d => IsValidLatLon(d.Latitude!.Value, d.Longitude!.Value))
                .Select(d => new
                {
                    Donor = d,
                    ApproxKm = HaversineKm(latitude, longitude, d.Latitude!.Value, d.Longitude!.Value)
                })
                .Where(x => x.ApproxKm <= AWS_LIMIT_KM)
                .Select(x => x.Donor)
                .ToList();

            if (!prefiltered.Any())
                return new List<NearbyDonorResponse>();

            // Build AWS matrix request
            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
                {
                    new List<double> { longitude, latitude }
                },
                DestinationPositions = prefiltered
                    .Select(d => new List<double> { d.Longitude!.Value, d.Latitude!.Value })
                    .ToList()
            };

            var resp = await _locationClient.CalculateRouteMatrixAsync(req);
            var results = new List<NearbyDonorResponse>();

            for (int i = 0; i < resp.RouteMatrix.Count; i++)
            {
                var cell = resp.RouteMatrix[i][0];
                if (cell?.Distance == null)
                    continue;

                double distanceKm = cell.Distance.Value / 1000.0;
                if (distanceKm <= radiusKm)
                {
                    var d = prefiltered[i];

                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.User.UserProfile.FullName,
                        BloodGroup = d.BloodType != null
                            ? $"{d.BloodType.Abo} {d.BloodType.Rh}"
                            : "Unknown",
                        AddressDisplay = d.Address != null
                            ? $"{d.Address.Line1}, {d.Address.District}, {d.Address.City}"
                            : "Chưa có địa chỉ",
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
        //  GET NEARBY REQUESTS — TO BE IMPLEMENTED LATER
        // ============================================================
        public async Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(
            double latitude,
            double longitude,
            double radiusKm)
        {
            return new List<NearbyRequestResponse>(); // sẽ viết sau cho Request
        }

        // ============================================================
        //  UTILITIES
        // ============================================================
        private static bool IsValidLatLon(double lat, double lon)
            => lat is >= -90 and <= 90 && lon is >= -180 and <= 180;

        private static double ToRad(double deg) => deg * Math.PI / 180.0;

        private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371;
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return R * (2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a)));
        }
    }
}