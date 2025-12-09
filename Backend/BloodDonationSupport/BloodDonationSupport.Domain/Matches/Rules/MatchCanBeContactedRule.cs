using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Matches.Rules
{
    public class MatchCanBeContactedRule : IBusinessRule
    {
        private readonly string _status;

        public MatchCanBeContactedRule(string status)
        {
            _status = status;
        }

        public string Message => "Only PROPOSED matches can be contacted.";

        public bool IsBroken()
            => _status != MatchStatus.PROPOSED;
    }
}
