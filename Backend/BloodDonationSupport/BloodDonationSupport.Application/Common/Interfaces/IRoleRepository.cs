using BloodDonationSupport.Domain.Roles.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IRoleRepository 
    {
        Task<RoleDomain?> GetByCodeAsync(string code);
        Task<IEnumerable<RoleDomain>> GetAllAsync();
    }
}
