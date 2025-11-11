using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _region;
        private readonly string _apiKey;
        private readonly string _routeCalculatorName;

        public LocationService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _httpClient = new HttpClient();

            _region = configuration["AWS:Region"] ?? "ap-southeast-2";
            _apiKey = configuration["AWS:LocationApiKey"]
                      ?? throw new Exception("Missing AWS Location API key");
            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                      ?? throw new Exception("Missing AWS Location Route Calculator name");
        }

        public async Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(double latitude, double longitude, double radiusKm)
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

            // ✅ Amazon Location Routes V2 - Calculate Route Matrix (calculator required)
            // Docs: POST https://routes.geo.{region}.amazonaws.com/routes/v2/matrix/calculators/{CalculatorName}
            var apiUrl = $"https://routes.geo.{_region}.amazonaws.com/routes/v2/matrix/calculators/{_routeCalculatorName}";

            var body = new
            {
                travelMode = "Car",
                departures = new[] { new { position = new[] { longitude, latitude } } },
                destinations = donors.Select(d => new
                {
                    position = new[] { d.Longitude ?? 0, d.Latitude ?? 0 }
                }).ToArray()
            };

            var request = new HttpRequestMessage(HttpMethod.Post, apiUrl)
            {
                Content = JsonContent.Create(body)
            };
            request.Headers.Add("X-Amz-Api-Key", _apiKey);

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"AWS Routes V2 error ({response.StatusCode}): {content}");

            using var doc = JsonDocument.Parse(content);
            var matrix = doc.RootElement.GetProperty("routeMatrix");

            var results = new List<NearbyDonorResponse>();
            for (int i = 0; i < matrix.GetArrayLength(); i++)
            {
                var cell = matrix[i][0];
                if (cell.ValueKind == JsonValueKind.Null || !cell.TryGetProperty("distance", out var dist))
                    continue;

                var distanceKm = dist.GetDouble() / 1000;
                if (distanceKm <= radiusKm)
                {
                    var d = donors[i];
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

            Console.WriteLine($"[AWS V2] Found {results.Count} donors within {radiusKm} km.");
            return results.OrderBy(x => x.DistanceKm).ToList();
        }
    }
}
