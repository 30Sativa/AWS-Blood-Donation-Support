namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class GetNearbyRequestsRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double RadiusKm { get; set; } = 10;
    }
}