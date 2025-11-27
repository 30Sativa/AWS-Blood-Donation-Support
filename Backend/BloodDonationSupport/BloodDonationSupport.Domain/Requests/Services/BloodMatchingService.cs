using BloodDonationSupport.Domain.Requests.Entities;

namespace BloodDonationSupport.Domain.Requests.Services
{
    public class BloodMatchingService
    {
        public bool IsCompatible(CompatibilityRuleDomain rule)
            => rule.IsCompatible;
    }
}