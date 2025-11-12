namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateReadyStatusRequest
    {
        public long DonorId { get; set; }
        public bool IsReady { get; set; }
    }
}