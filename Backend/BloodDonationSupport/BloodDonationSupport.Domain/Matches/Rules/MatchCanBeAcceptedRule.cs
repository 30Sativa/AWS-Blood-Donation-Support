using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches.Rules
{
    public class MatchCanBeAcceptedRule : IBusinessRule
    {
        private readonly string _status;

        public MatchCanBeAcceptedRule(string status)
        {
            _status = status;
        }

        public string Message => "Match must be CONTACTED before donor can accept.";

        public bool IsBroken()
            => _status != MatchStatus.CONTACTED;
    }
}
