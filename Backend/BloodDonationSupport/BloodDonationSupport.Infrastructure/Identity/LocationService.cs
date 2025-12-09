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

        public LocationService(AppDbContext context, IConfiguration configuration, IAmazonLocationService locationClient)
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
        // PARSE ADDRESS (GEOCODING)
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

            var place = response.Results[0].Place;

            if (place.Geometry?.Point == null || place.Geometry.Point.Count != 2)
                return null;

            double latitude = place.Geometry.Point[1];
            double longitude = place.Geometry.Point[0];

            string label = place.Label ?? fullAddress;
            var parts = label.Split(',', StringSplitOptions.TrimEntries);

            return new ParsedAddressResult
            {
                Line1 = parts.ElementAtOrDefault(0) ?? "",
                District = parts.ElementAtOrDefault(1) ?? "",
                City = parts.ElementAtOrDefault(2) ?? "",
                Province = parts.ElementAtOrDefault(3) ?? "",
                Country = parts.ElementAtOrDefault(4) ?? "Vietnam",
                PostalCode = "",
                NormalizedAddress = label,
                ConfidenceScore = response.Results[0].Relevance,
                Latitude = latitude,
                Longitude = longitude
            };
        }

        // ============================================================
        // GET NEARBY DONORS — FIXED (Distance already in KM)
        // ============================================================
        public async Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(double latitude, double longitude, double radiusKm)
        {
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

            var candidates = donors
                .Where(d => IsValidLatLon(d.Latitude!.Value, d.Longitude!.Value))
                .ToList();

            // Prepare AWS RouteMatrix input
            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
                {
                    new() { longitude, latitude }
                },
                DestinationPositions = candidates
                    .Select(x => new List<double> { x.Longitude!.Value, x.Latitude!.Value })
                    .ToList()
            };

            var resp = await _locationClient.CalculateRouteMatrixAsync(req);

            if (resp?.RouteMatrix == null || resp.RouteMatrix.Count == 0)
                return new List<NearbyDonorResponse>();

            var firstRow = resp.RouteMatrix[0];
            var results = new List<NearbyDonorResponse>();

            for (int i = 0; i < candidates.Count; i++)
            {
                var entry = firstRow[i];
                if (entry?.Distance == null)
                    continue;

                // 🔥 FIX: AWS ESRI Distance is already in KM → DO NOT divide by 1000
                double distanceKm = entry.Distance.Value;

                Console.WriteLine($"[AWS RAW] Donor #{i} → Distance = {distanceKm}");

                if (distanceKm <= radiusKm)
                {
                    var d = candidates[i];

                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.User.UserProfile.FullName,
                        BloodGroup = $"{d.BloodType?.Abo} {d.BloodType?.Rh}",
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
        // GET NEARBY REQUESTS — FIXED
        // ============================================================
        public async Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(double latitude, double longitude, double radiusKm)
        {
            if (!IsValidLatLon(latitude, longitude))
                return new List<NearbyRequestResponse>();

            var requests = await _context.Requests
                .Include(r => r.BloodType)
                .Include(r => r.Component)
                .Include(r => r.DeliveryAddress)
                .Include(r => r.RequesterUser).ThenInclude(u => u.UserProfile)
                .Where(r => r.Latitude != null && r.Longitude != null)
                .ToListAsync();

            if (!requests.Any())
                return new List<NearbyRequestResponse>();

            var candidates = requests
                .Where(r => IsValidLatLon(r.Latitude!.Value, r.Longitude!.Value))
                .ToList();

            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
                {
                    new() { longitude, latitude }
                },
                DestinationPositions = candidates
                    .Select(x => new List<double> { x.Longitude!.Value, x.Latitude!.Value })
                    .ToList()
            };

            var resp = await _locationClient.CalculateRouteMatrixAsync(req);

            if (resp?.RouteMatrix == null || resp.RouteMatrix.Count == 0)
                return new List<NearbyRequestResponse>();

            var firstRow = resp.RouteMatrix[0];
            var results = new List<NearbyRequestResponse>();

            for (int i = 0; i < candidates.Count; i++)
            {
                var entry = firstRow[i];
                if (entry?.Distance == null)
                    continue;

                // 🔥 FIX: Distance already km
                double distanceKm = entry.Distance.Value;

                Console.WriteLine($"[AWS RAW] Request #{i} → Distance = {distanceKm}");

                if (distanceKm <= radiusKm)
                {
                    var r = candidates[i];

                    results.Add(new NearbyRequestResponse
                    {
                        RequestId = r.RequestId,
                        RequesterUserId = r.RequesterUserId,
                        FullName = r.RequesterUser?.UserProfile?.FullName,
                        BloodGroup = $"{r.BloodType?.Abo} {r.BloodType?.Rh}",
                        ComponentName = r.Component?.ComponentName,
                        AddressDisplay = r.DeliveryAddress != null
                            ? $"{r.DeliveryAddress.Line1}, {r.DeliveryAddress.District}, {r.DeliveryAddress.City}"
                            : "Chưa có địa chỉ",
                        Urgency = r.Urgency,
                        Status = r.Status,
                        QuantityUnits = r.QuantityUnits,
                        NeedBeforeUtc = r.NeedBeforeUtc,
                        CreatedAt = r.CreatedAt,
                        Latitude = r.Latitude,
                        Longitude = r.Longitude,
                        DistanceKm = distanceKm
                    });
                }
            }

            return results.OrderBy(x => x.DistanceKm).ToList();
        }

        // UTIL
        private static bool IsValidLatLon(double lat, double lon)
            => lat is >= -90 and <= 90 && lon is >= -180 and <= 180;
    }
}
