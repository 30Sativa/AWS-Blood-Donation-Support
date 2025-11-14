using BloodDonationSupport.Domain.Requests.Enums;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class UpdateRequestStatusRequest
    {
        public string NewStatus { get; set; } = string.Empty;
    }
}