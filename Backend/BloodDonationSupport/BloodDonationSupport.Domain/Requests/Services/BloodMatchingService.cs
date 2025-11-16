using BloodDonationSupport.Domain.Requests.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Services
{
    public class BloodMatchingService
    {
        public bool IsCompatible(CompatibilityRuleDomain rule)
            => rule.IsCompatible;
    }
}
