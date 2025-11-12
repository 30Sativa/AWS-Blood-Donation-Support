namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class GetNearbyDonorsRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double RadiusKm { get; set; } = 10;
    }
}