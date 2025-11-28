using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Events
{
    public class RequestMatchingStartedEvent : IDomainEvent
    {
        public long RequestId { get; }

        public DateTime OccurredOn { get; } = DateTime.UtcNow;



        public RequestMatchingStartedEvent(long requestId)
        {
            RequestId = requestId;
        }
    }
}
