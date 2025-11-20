namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateDonorRequest
    {
        public int BloodTypeId { get; set; }
        public string FullAddress { get; set; } = null!;
        public decimal TravelRadiusKm { get; set; }

        public List<DonorAvailabilityDto> Availabilities { get; set; } = new();
        public List<int> HealthConditionIds { get; set; } = new();
    }
}

