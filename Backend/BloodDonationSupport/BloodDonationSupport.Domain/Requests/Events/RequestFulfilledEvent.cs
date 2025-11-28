using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Events
{
    public class RequestFulfilledEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
        public long RequestId { get; }

        public RequestFulfilledEvent(long requestId)
        {
            RequestId = requestId;
        }
    }
}
