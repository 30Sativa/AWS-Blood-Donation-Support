using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches.Events
{
    public class MatchContactedEvent : IDomainEvent
    {
        public long MatchId { get; }
        public long DonorId { get; }
        public long RequestId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public MatchContactedEvent(long matchId, long donorId, long requestId)
        {
            MatchId = matchId;
            DonorId = donorId;
            RequestId = requestId;
        }
    }
}
