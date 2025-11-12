using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
