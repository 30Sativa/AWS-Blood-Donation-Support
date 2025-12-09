using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Events
{
    public class MatchEventMessage
    {
        public long MatchId { get; set; }
        public long RequestId { get; set; }
        public long DonorId { get; set; }
        public string Event { get; set; } = "";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
