using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Events
{
    public class RequestCancelledEvent : IDomainEvent
    {
        public long RequestId { get; }
        public string Reason { get; }

        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public RequestCancelledEvent(long requestId, string reason)
        {
            RequestId = requestId;
            Reason = reason;
        }
    }
}
