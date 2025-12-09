using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Requests.Events
{
    public class RequestCreatedEvent : IDomainEvent
    {
        public long RequestId { get; }
        public long RequesterUserId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public RequestCreatedEvent(long requestId, long requesterUserId)
        {
            RequestId = requestId;
            RequesterUserId = requesterUserId;
        }
    }
}