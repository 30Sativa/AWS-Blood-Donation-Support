using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Addresses.DTOs;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _context;
        private readonly IAmazonLocationService _locationClient;
        private readonly ILogger<LocationService> _logger;

        private readonly string _routeCalculatorName;
        private readonly string _placeIndexName;

        public LocationService(
            AppDbContext context,
            IConfiguration configuration,
            IAmazonLocationService locationClient,
            ILogger<LocationService> logger)
        {
            _context = context;
            _locationClient = locationClient;
            _logger = logger;

            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                ?? throw new Exception("Missing AWS LocationRouteCalculatorName");

            _placeIndexName = configuration["AWS:LocationPlaceIndexName"]
                ?? throw new Exception("Missing AWS LocationPlaceIndexName");
        }

        // ============================================================
        // GET NEARBY DONORS — WITH FULL LOGGING
        // ============================================================
        public async Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(double latitude, double longitude, double radiusKm)
        {
            _logger.LogWarning($"[START] GetNearbyDonors: Requester = ({latitude}, {longitude}), Radius = {radiusKm} km");

            // Load donors có tọa độ
            var donors = await _context.Donors
                .Include(d => d.User).ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.Address)
                .Where(d => d.IsReady && d.Latitude != null && d.Longitude != null)
                .ToListAsync();

            _logger.LogWarning($"[DB] Total donors loaded with valid Lat/Lng: {donors.Count}");

            if (!donors.Any())
            {
                _logger.LogWarning("[WARN] No donors found.");
                return new List<NearbyDonorResponse>();
            }

            // ================================================
            // 1) Lọc donor không hợp lệ, thêm log FULL
            // ================================================
            var validCandidates = new List<dynamic>();

            foreach (var d in donors)
            {
                double donorLat = d.Latitude!.Value;
                double donorLng = d.Longitude!.Value;

                if (donorLat == 0 || donorLng == 0)
                {
                    _logger.LogError($"[SKIP] Donor {d.DonorId} has invalid coordinates (0,0)");
                    continue;
                }

                // Tính khoảng cách thẳng (Haversine)
                var straight = Haversine(latitude, longitude, donorLat, donorLng);

                _logger.LogWarning($"[CHECK] Donor {d.DonorId}: Haversine = {straight} km → Address = {d.Address?.Line1}");

                // AWS giới hạn 400km → phải skip trước
                if (straight > 400)
                {
                    _logger.LogError($"[SKIP] Donor {d.DonorId} is {straight} km away (>400 km AWS limit)");
                    continue;
                }

                validCandidates.Add(new { Donor = d, DistanceStraight = straight });
            }

            _logger.LogWarning($"[VALID] Total donors after Haversine pre-filter: {validCandidates.Count}");

            if (!validCandidates.Any())
            {
                _logger.LogWarning("[WARN] No donors within AWS 400km limit.");
                return new List<NearbyDonorResponse>();
            }


            // ================================================
            // 2) Gọi AWS Location RouteMatrix
            // ================================================
            _logger.LogWarning("=== AWS RouteMatrix Input ===");
            _logger.LogWarning($"Departure = [{longitude}, {latitude}]");

            foreach (var c in validCandidates)
                _logger.LogWarning($"Dest Donor {c.Donor.DonorId} = [{c.Donor.Longitude}, {c.Donor.Latitude}]");

            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>> {
            new() { longitude, latitude }
        },
                DestinationPositions = validCandidates
                    .Select(x => new List<double> { x.Donor.Longitude!.Value, x.Donor.Latitude!.Value })
                    .ToList()
            };

            CalculateRouteMatrixResponse resp;

            try
            {
                resp = await _locationClient.CalculateRouteMatrixAsync(req);
            }
            catch (ValidationException vex)
            {
                _logger.LogError(vex, "[AWS ERROR] ValidationException → Likely >400 km distance in input");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AWS ERROR] RouteMatrix failed");
                throw;
            }

            if (resp?.RouteMatrix == null)
            {
                _logger.LogError("[ERROR] RouteMatrix NULL");
                return new List<NearbyDonorResponse>();
            }

            var row = resp.RouteMatrix[0];
            var results = new List<NearbyDonorResponse>();

            _logger.LogWarning("=== AWS RouteMatrix Response ===");

            for (int i = 0; i < validCandidates.Count; i++)
            {
                var entry = row[i];
                var candidate = validCandidates[i];

                if (entry?.Distance == null)
                {
                    _logger.LogWarning($"[AWS] Donor {candidate.Donor.DonorId} → Distance NULL");
                    continue;
                }

                double routeKm = entry.Distance.Value;
                _logger.LogWarning($"[AWS] Donor {candidate.Donor.DonorId} → Route = {routeKm} km, Straight = {candidate.DistanceStraight} km");

                if (routeKm <= radiusKm)
                {
                    var d = candidate.Donor;

                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.User.UserProfile.FullName,
                        BloodGroup = $"{d.BloodType?.Abo} {d.BloodType?.Rh}",
                        AddressDisplay = d.Address?.Line1 ?? "Chưa có địa chỉ",
                        NextEligibleDate = d.NextEligibleDate,
                        Latitude = d.Latitude,
                        Longitude = d.Longitude,
                        DistanceKm = routeKm,
                        IsReady = true
                    });
                }
                else
                {
                    _logger.LogWarning($"[FILTER] Donor {candidate.Donor.DonorId} removed (route {routeKm} > {radiusKm})");
                }
            }

            return results.OrderBy(x => x.DistanceKm).ToList();
        }


        // ============================================================
        // GET NEARBY REQUESTS — ALSO LOGGING
        // ============================================================
        public async Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(double latitude, double longitude, double radiusKm)
        {
            _logger.LogWarning($"[START] GetNearbyRequests: ({latitude}, {longitude}) Radius = {radiusKm}");
            // ... (tương tự, bạn muốn tôi thêm full log luôn không?)
            return new List<NearbyRequestResponse>();
        }
        // ============================================================
        // PARSE ADDRESS (GEOCODING)
        // ============================================================
        public async Task<ParsedAddressResult?> ParseAddressAsync(string fullAddress)
        {
            _logger.LogWarning($"[ParseAddress] Input = {fullAddress}");

            if (string.IsNullOrWhiteSpace(fullAddress))
                return null;

            var request = new SearchPlaceIndexForTextRequest
            {
                IndexName = _placeIndexName,
                Text = fullAddress,
                MaxResults = 1
            };

            SearchPlaceIndexForTextResponse response;

            try
            {
                response = await _locationClient.SearchPlaceIndexForTextAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ParseAddress] AWS Error");
                return null;
            }

            if (response.Results == null || response.Results.Count == 0)
            {
                _logger.LogWarning("[ParseAddress] No results from AWS");
                return null;
            }

            var place = response.Results[0].Place;

            if (place.Geometry?.Point == null || place.Geometry.Point.Count != 2)
            {
                _logger.LogWarning("[ParseAddress] Invalid geometry");
                return null;
            }

            double latitude = place.Geometry.Point[1];
            double longitude = place.Geometry.Point[0];

            string label = place.Label ?? fullAddress;
            var parts = label.Split(',', StringSplitOptions.TrimEntries);

            var result = new ParsedAddressResult
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

            _logger.LogWarning($"[ParseAddress] Parsed → Lat={latitude}, Lng={longitude}");

            return result;
        }
        private static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // km
            double dLat = (lat2 - lat1) * Math.PI / 180.0;
            double dLon = (lon2 - lon1) * Math.PI / 180.0;

            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

    }
}
