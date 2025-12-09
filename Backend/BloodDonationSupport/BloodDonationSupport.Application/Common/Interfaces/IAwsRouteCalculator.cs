namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAwsRouteCalculator
    {
        Task<double?> CalculateDistanceKmAsync(
            double fromLat, double fromLng,
            double toLat, double toLng);
    }
}