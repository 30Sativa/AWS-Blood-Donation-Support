namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateAvailabilityRequest
    {
        public long DonorId { get; set; }

        public List<DonorAvailabilityDto> Availabilities { get; set; }
            = new();
    }
}