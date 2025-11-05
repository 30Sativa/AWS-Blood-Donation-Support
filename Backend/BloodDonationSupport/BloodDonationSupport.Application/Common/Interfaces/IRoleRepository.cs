using BloodDonationSupport.Domain.Roles.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IRoleRepository
    {
        Task<RoleDomain?> GetByCodeAsync(string code);

        Task<IEnumerable<RoleDomain>> GetAllAsync();

        Task<bool> IsExistRoleCodeAsync(string code);
    }
}