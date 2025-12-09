using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches
{
    public class MatchStatus
    {
        public const string PROPOSED = "PROPOSED";
        public const string CONTACTED = "CONTACTED";
        public const string ACCEPTED = "ACCEPTED";
        public const string DECLINED = "DECLINED";
        public const string NO_ANSWER = "NO_ANSWER";
    }
}
