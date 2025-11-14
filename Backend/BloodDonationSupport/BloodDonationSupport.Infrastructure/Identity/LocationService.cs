using Amazon;
using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
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

            // Prefilter to avoid AWS RouteMatrix 400 km constraint from origin to any destination
            // Use a quick Haversine estimation to keep only donors within 400 km of the request point
            const double awsMaxKm = 400.0;
            double ToRadians(double deg) => deg * Math.PI / 180.0;
            double HaversineKm(double lat1, double lon1, double lat2, double lon2)
            {
                const double earthRadiusKm = 6371.0;
                var dLat = ToRadians(lat2 - lat1);
                var dLon = ToRadians(lon2 - lon1);
                var a =
                    Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return earthRadiusKm * c;
            }

            var prefiltered = donors
                .Select(d => new
                {
                    Donor = d,
                    ApproxKm = HaversineKm(latitude, longitude, d.Latitude ?? 0, d.Longitude ?? 0)
                })
                .Where(x => x.ApproxKm <= awsMaxKm) // ensure compatibility with AWS limitation
                .Select(x => x.Donor)
                .ToList();

            if (!prefiltered.Any())
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
                DestinationPositions = prefiltered
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

            Console.WriteLine($"[AWS V2] Found {results.Count} donors within {radiusKm} km.");
            return results.OrderBy(x => x.DistanceKm).ToList();
        }

        public async Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(double latitude, double longitude, double radiusKm)
        {
            var requests = await _context.Requests
                .Include(r => r.RequesterUser).ThenInclude(u => u.UserProfile)
                .Include(r => r.BloodType)
                .Include(r => r.Component)
                .Include(r => r.DeliveryAddress)
                .Where(r => r.Status == "REQUESTED"
                            && r.Latitude != null
                            && r.Longitude != null)
                .Select(r => new
                {
                    r.RequestId,
                    r.RequesterUserId,
                    FullName = r.RequesterUser.UserProfile.FullName,
                    BloodGroup = r.BloodType != null
                        ? $"{r.BloodType.Abo} {r.BloodType.Rh}"
                        : "Unknown",
                    Component = r.Component.ComponentName,
                    AddressDisplay = $"{r.DeliveryAddress.Line1}, {r.DeliveryAddress.District}, {r.DeliveryAddress.City}",
                    r.Status,
                    r.Urgency,
                    r.QuantityUnits,
                    r.NeedBeforeUtc,
                    r.CreatedAt,
                    Latitude = r.Latitude,   
                    Longitude = r.Longitude    
                })
                .ToListAsync();

            if (!requests.Any())
                return new List<NearbyRequestResponse>();

            // Prefilter bằng Haversine
            double ToRadians(double deg) => deg * Math.PI / 180.0;
            double HaversineKm(double lat1, double lon1, double lat2, double lon2)
            {
                const double R = 6371.0;
                var dLat = ToRadians(lat2 - lat1);
                var dLon = ToRadians(lon2 - lon1);
                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                        + Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2))
                        * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return R * c;
            }

            var results = requests
                .Select(r => new NearbyRequestResponse
                {
                    RequestId = r.RequestId,
                    FullName = r.FullName,
                    BloodGroup = r.BloodGroup,
                    Component = r.Component,
                    AddressDisplay = r.AddressDisplay,
                    Status = r.Status,
                    Urgency = r.Urgency.ToString(),
                    QuantityUnits = r.QuantityUnits,
                    NeedBeforeUtc = r.NeedBeforeUtc,
                    CreatedAt = r.CreatedAt,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    DistanceKm = HaversineKm(latitude, longitude, r.Latitude ?? 0, r.Longitude ?? 0)
                })
                .Where(x => x.DistanceKm <= radiusKm)
                .OrderBy(x => x.DistanceKm)
                .ToList();

            return results;
        }


    }
}