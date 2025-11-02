using BloodDonationSupport.Domain.Users.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserRepository : IGenericRepository<UserDomain>
    {
        Task<bool> IsExistEmailAsync(string email);

        Task<UserDomain?> GetByEmailAsync(string email);

        Task<UserDomain?> GetByEmailWithRolesAsync(string email);

        Task AssignDefaultRoleAsync(long userId);

        Task<long> GetUserIdByEmailAsync(string email);

        
    }
}