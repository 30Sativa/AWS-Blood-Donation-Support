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

        public LocationService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _httpClient = new HttpClient();

            _region = configuration["AWS:Region"] ?? "ap-southeast-2";
            _apiKey = configuration["AWS:LocationApiKey"] ?? throw new Exception("Missing AWS Location API key");
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
                    BloodGroup = d.BloodType != null ? $"{d.BloodType.Abo} {d.BloodType.Rh}" : "Unknown",
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

            // URL API mới (không cần Route Calculator)
            var apiUrl = $"https://routes.geo.{_region}.amazonaws.com/v2/routes/calculate";

            var requestBody = new
            {
                DeparturePosition = new[] { longitude, latitude },
                DestinationPositions = donors
                    .Select(d => new[] { d.Longitude ?? 0, d.Latitude ?? 0 })
                    .ToArray(),
                TravelMode = "Car"
            };

            var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Add("X-Amz-Api-Key", _apiKey);
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

            var results = new List<NearbyDonorResponse>();
            var routes = json.RootElement.GetProperty("Routes");

            int i = 0;
            foreach (var route in routes.EnumerateArray())
            {
                var distanceKm = route.GetProperty("Distance").GetDouble() / 1000;
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
                i++;
            }

            Console.WriteLine($"[AWS V2] Found {results.Count} donors within {radiusKm} km.");
            return results.OrderBy(x => x.DistanceKm).ToList();
        }
    }
}
