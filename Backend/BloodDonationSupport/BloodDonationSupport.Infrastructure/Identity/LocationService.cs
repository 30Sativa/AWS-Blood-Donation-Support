using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Amazon;
using Amazon.LocationService;
using Amazon.LocationService.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class LocationService : ILocationService
    {
        private readonly AppDbContext _context;
        private readonly string _region;
        private readonly string _routeCalculatorName;
        private readonly IAmazonLocationService _locationClient;

        public LocationService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;

            _region = configuration["AWS:Region"] ?? "ap-southeast-2";
            _routeCalculatorName = configuration["AWS:LocationRouteCalculatorName"]
                      ?? throw new Exception("Missing AWS Location Route Calculator name");

            // Use AWS SDK (SigV4) instead of API Key to avoid authorization issues
            _locationClient = new AmazonLocationServiceClient(RegionEndpoint.GetBySystemName(_region));
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

            // ✅ Use AWS SDK CalculateRouteMatrix (SigV4)
            var req = new CalculateRouteMatrixRequest
            {
                CalculatorName = _routeCalculatorName,
                TravelMode = TravelMode.Car,
                DeparturePositions = new List<List<double>>
                {
                    new List<double> { longitude, latitude } // [lng, lat]
                },
                DestinationPositions = donors
                    .Select(d => new List<double> { d.Longitude ?? 0, d.Latitude ?? 0 })
                    .ToList()
            };

            var resp = await _locationClient.CalculateRouteMatrixAsync(req);
            var matrix = resp.RouteMatrix; // List<List<RouteMatrixEntry>>

            var results = new List<NearbyDonorResponse>();
            for (int i = 0; i < matrix.Count; i++)
            {
                var cell = matrix[i][0];
                if (cell == null || cell.Distance == null)
                    continue;

                var distanceKm = (cell.Distance.Value) / 1000.0;
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
