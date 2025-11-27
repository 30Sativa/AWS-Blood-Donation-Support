namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class CompatibleDonorsResponse
    {
        public long RequestId { get; set; }
        public List<CompatibleDonorDto> Donors { get; set; } = new();
    }
}