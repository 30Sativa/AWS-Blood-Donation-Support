namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateDonorLocationRequest
    {
        public long DonorId { get; set; }
        public string FullAddress { get; set; } = string.Empty;
    }
}