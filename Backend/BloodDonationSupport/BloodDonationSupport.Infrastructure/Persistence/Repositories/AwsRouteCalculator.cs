using Amazon.LocationService;
using Amazon.LocationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class AwsRouteCalculator : IAwsRouteCalculator
    {
        private readonly IAmazonLocationService _client;
        private readonly string _calculatorName;

        public AwsRouteCalculator(IAmazonLocationService client, IConfiguration config)
        {
            _client = client;

            // Lấy tên calculator từ appsettings.json
            _calculatorName = config["AWS:LocationRouteCalculatorName"]
                ?? throw new Exception("Missing AWS:LocationRouteCalculatorName in appsettings.json");
        }

        public async Task<double?> CalculateDistanceKmAsync(
            double fromLat, double fromLng,
            double toLat, double toLng)
        {
            try
            {
                var request = new CalculateRouteRequest
                {
                    CalculatorName = _calculatorName,
                    DeparturePosition = new List<double> { fromLng, fromLat },
                    DestinationPosition = new List<double> { toLng, toLat }
                };

                var response = await _client.CalculateRouteAsync(request);

                // Distance (meters) -> Summary.Distance
                var distanceMeters = response.Summary?.Distance;
                if (distanceMeters == null)
                    return null;

                return distanceMeters.Value / 1000.0; // meters → km
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, trả null → handler sẽ bỏ qua donor đó
                Console.WriteLine($"AWS Route error: {ex.Message}");
                return null;
            }
        }
    }
}
