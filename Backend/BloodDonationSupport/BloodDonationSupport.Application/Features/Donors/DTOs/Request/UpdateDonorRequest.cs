namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateDonorRequest
    {
        public int? BloodTypeId { get; set; }
        public long? AddressId { get; set; }
        public decimal? TravelRadiusKm { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}

