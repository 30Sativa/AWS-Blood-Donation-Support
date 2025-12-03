using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches.Rules
{
    public class MatchCanBeDeclinedRule : IBusinessRule
    {
        private readonly string _status;

        public MatchCanBeDeclinedRule(string status)
        {
            _status = status;
        }

        public string Message => "Match must be CONTACTED before donor can decline.";

        public bool IsBroken()
            => _status != MatchStatus.CONTACTED;
    }
}
