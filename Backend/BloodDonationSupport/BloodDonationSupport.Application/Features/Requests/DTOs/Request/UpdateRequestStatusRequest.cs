using BloodDonationSupport.Domain.Requests.Enums;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class UpdateRequestStatusRequest
    {
        public long RequestId { get; set; }
        public RequestStatus NewStatus { get; set; }
    }
}