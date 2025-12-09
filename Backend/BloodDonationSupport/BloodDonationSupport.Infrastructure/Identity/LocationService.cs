using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Addresses.DTOs;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
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
            _logger.LogWarning($"[START] GetNearbyDonors: requester=({latitude}, {longitude}), radius={radiusKm}");

            var donors = await _context.Donors
                .Include(d => d.User).ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.Address)
                .Where(d => d.IsReady && d.Latitude != null && d.Longitude != null)
                .ToListAsync();

            _logger.LogWarning($"[DB] Loaded donors with coords: {donors.Count}");

            if (!donors.Any())
                return new List<NearbyDonorResponse>();

            // =============================================
            // 1) Pre-filter using Haversine + skip invalid
            // =============================================

            var validCandidates = new List<(Donor donor, double straight)>();

            foreach (var d in donors)
            {
                var lat = d.Latitude!.Value;
                var lng = d.Longitude!.Value;

                if (lat == 0 || lng == 0)
                {
                    _logger.LogError($"[SKIP] Donor {d.DonorId} invalid coords (0,0)");
                    continue;
                }

                var straight = Haversine(latitude, longitude, lat, lng);
                _logger.LogWarning($"[CHECK] Donor {d.DonorId}: straight={straight} km");

                if (straight > 400)
                {
                    _logger.LogError($"[SKIP] Donor {d.DonorId} straight={straight} > 400km AWS limit");
                    continue;
                }

                validCandidates.Add((d, straight));
            }

            _logger.LogWarning($"[VALID] Candidates after precheck: {validCandidates.Count}");

            if (!validCandidates.Any())
            {
                _logger.LogWarning("[WARN] No donors within AWS 400km zone");
                return new List<NearbyDonorResponse>();
            }

            // =============================================
            // 2) Prepare AWS RouteMatrix request
            // =============================================

            _logger.LogWarning("=== AWS RouteMatrix Input ===");
            _logger.LogWarning($"Departure = [{longitude}, {latitude}]");

            foreach (var c in validCandidates)
            {
                _logger.LogWarning($"Dest Donor {c.donor.DonorId} = [{c.donor.Longitude}, {c.donor.Latitude}]");
            }

            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
        {
            new() { longitude, latitude }
        },
                DestinationPositions = validCandidates
                    .Select(c => new List<double> { c.donor.Longitude!.Value, c.donor.Latitude!.Value })
                    .ToList()
            };

            CalculateRouteMatrixResponse resp;

            try
            {
                resp = await _locationClient.CalculateRouteMatrixAsync(req);
            }
            catch (ValidationException vex)
            {
                _logger.LogError(vex, "[AWS ERROR] ValidationException - likely still >400km");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AWS ERROR] RouteMatrix failed");
                throw;
            }

            if (resp.RouteMatrix == null)
                return new List<NearbyDonorResponse>();

            // =============================================
            // 3) Parse AWS results
            // =============================================

            var row = resp.RouteMatrix[0];
            var results = new List<NearbyDonorResponse>();

            _logger.LogWarning("=== AWS RouteMatrix Response ===");

            for (int i = 0; i < validCandidates.Count; i++)
            {
                var entry = row[i];
                var (donor, straight) = validCandidates[i];

                if (entry?.Distance == null)
                {
                    _logger.LogWarning($"[AWS] Donor {donor.DonorId} → NULL distance");
                    continue;
                }

                double routeKm = entry.Distance.Value;

                _logger.LogWarning($"[AWS] Donor {donor.DonorId}: route={routeKm} km, straight={straight} km");

                if (routeKm <= radiusKm)
                {
                    results.Add(new NearbyDonorResponse
                    {
                        DonorId = donor.DonorId,
                        FullName = donor.User.UserProfile.FullName,
                        BloodGroup = $"{donor.BloodType?.Abo} {donor.BloodType?.Rh}",
                        AddressDisplay = donor.Address?.Line1,
                        NextEligibleDate = donor.NextEligibleDate,
                        Latitude = donor.Latitude,
                        Longitude = donor.Longitude,
                        DistanceKm = routeKm,
                        IsReady = true
                    });
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
