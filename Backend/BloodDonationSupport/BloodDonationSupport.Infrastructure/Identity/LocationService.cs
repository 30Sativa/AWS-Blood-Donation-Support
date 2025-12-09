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
            _logger.LogWarning($"[START] GetNearbyDonors: ({latitude}, {longitude}) Radius = {radiusKm}");

            var donors = await _context.Donors
                .Include(d => d.User).ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.Address)
                .Where(d => d.IsReady && d.Latitude != null && d.Longitude != null)
                .ToListAsync();

            _logger.LogWarning($"[DB] Total Ready Donors Loaded: {donors.Count}");

            if (!donors.Any())
            {
                _logger.LogWarning("[WARN] No donors found.");
                return new List<NearbyDonorResponse>();
            }

            // Log toàn bộ donor trong DB
            foreach (var d in donors)
                _logger.LogWarning($"[DB DONOR] ID={d.DonorId} Lat={d.Latitude} Lng={d.Longitude}");

            var candidates = donors.ToList();

            // Log DestinationPositions trước AWS
            _logger.LogWarning("=== AWS Request Input ===");
            _logger.LogWarning($"Departure: [{longitude}, {latitude}]");

            for (int i = 0; i < candidates.Count; i++)
            {
                _logger.LogWarning($"Dest #{i}: [{candidates[i].Longitude}, {candidates[i].Latitude}]");
            }

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

            CalculateRouteMatrixResponse resp;

            try
            {
                resp = await _locationClient.CalculateRouteMatrixAsync(req);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ERROR] AWS RouteMatrix failed");
                throw;
            }

            if (resp?.RouteMatrix == null)
            {
                _logger.LogError("[ERROR] RouteMatrix NULL");
                return new List<NearbyDonorResponse>();
            }

            var firstRow = resp.RouteMatrix[0];
            var results = new List<NearbyDonorResponse>();

            // Log response
            _logger.LogWarning("=== AWS Response ===");

            for (int i = 0; i < candidates.Count; i++)
            {
                var entry = firstRow[i];

                if (entry?.Distance == null)
                {
                    _logger.LogWarning($"[AWS RAW] Donor #{i} → NULL Distance");
                    continue;
                }

                double distanceKm = entry.Distance.Value;

                _logger.LogWarning($"[AWS RAW] Donor #{i} → Distance = {distanceKm} KM");

                if (distanceKm <= radiusKm)
                {
                    var d = candidates[i];
                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = d.DonorId,
                        FullName = d.User.UserProfile.FullName,
                        BloodGroup = $"{d.BloodType?.Abo} {d.BloodType?.Rh}",
                        AddressDisplay = d.Address?.Line1 ?? "Chưa có địa chỉ",
                        NextEligibleDate = d.NextEligibleDate,
                        Latitude = d.Latitude,
                        Longitude = d.Longitude,
                        DistanceKm = distanceKm,
                        IsReady = true
                    });
                }
                else
                {
                    _logger.LogWarning($"[FILTER] Donor #{i} removed → distance {distanceKm} > {radiusKm}");
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

    }
}
