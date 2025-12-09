using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches.Events
{
    public class MatchDeclinedEvent : IDomainEvent
    {
        public long MatchId { get; }
        public long DonorId { get; }
        public long RequestId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public MatchDeclinedEvent(long matchId, long donorId, long requestId)
        {
            MatchId = matchId;
            DonorId = donorId;
            RequestId = requestId;
        }
    }
}
