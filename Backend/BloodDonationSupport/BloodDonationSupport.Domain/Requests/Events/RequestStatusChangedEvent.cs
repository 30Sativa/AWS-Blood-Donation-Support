using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Requests.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Events
{
    public class RequestStatusChangedEvent : IDomainEvent
    {
        public long RequestId { get; }
        public RequestStatus NewStatus { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public RequestStatusChangedEvent(long requestId, RequestStatus newStatus)
        {
            RequestId = requestId;
            NewStatus = newStatus;
        }
    }
}
