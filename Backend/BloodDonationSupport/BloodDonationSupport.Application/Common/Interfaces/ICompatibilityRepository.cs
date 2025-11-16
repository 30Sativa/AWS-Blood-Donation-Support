using BloodDonationSupport.Domain.Requests.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ICompatibilityRepository
    {
        Task<List<CompatibilityRuleDomain>> GetRulesAsync(int recipientBloodTypeId, int componentId);
    }
}
