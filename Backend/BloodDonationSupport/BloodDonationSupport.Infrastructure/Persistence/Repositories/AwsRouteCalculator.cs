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
            _calculatorName = config["AWS:LocationRouteCalculatorName"]!;
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

                // AWS trả về Distance trong Summary
                var distanceMeters = response.Summary?.Distance;
                if (distanceMeters == null)
                    return null;

                return distanceMeters.Value / 1000.0; // convert to km
            }
            catch
            {
                // Nếu fail → trả về null để logic phía trên skip donor
                return null;
            }
        }
    }
}
