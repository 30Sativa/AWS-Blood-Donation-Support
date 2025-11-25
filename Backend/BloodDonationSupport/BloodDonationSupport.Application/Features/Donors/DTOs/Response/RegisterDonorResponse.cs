namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class RegisterDonorResponse
    {
        public long DonorId { get; set; }
        public long UserId { get; set; }
        public int? BloodTypeId { get; set; }
        public long? AddressId { get; set; }

        public decimal TravelRadiusKm { get; set; }
        public bool IsReady { get; set; }
        public DateOnly? NextEligibleDate { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? AddressDisplay { get; set; }

        public List<DonorAvailabilityResponse>? Availabilities { get; set; }
        public List<DonorHealthConditionItemResponse>? HealthConditions { get; set; }
    }


}