using BloodDonationSupport.Domain.Requests.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ICompatibilityRepository
    {
        Task<List<CompatibilityRuleDomain>> GetRulesAsync(int recipientBloodTypeId, int componentId);
    }
}