using BloodDonationSupport.Domain.Users.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserRepository : IGenericRepository<UserDomain>
    {
        Task<bool> IsExistEmailAsync(string email);

        Task<UserDomain?> GetByEmailAsync(string email);

        Task<UserDomain?> GetByEmailWithRolesAsync(string email);

        Task AssignDefaultRoleAsync(long userId);

        Task AssignRoleAsync(long userId, string roleCode);

        Task<long> GetUserIdByEmailAsync(string email);

        Task<IEnumerable<string>> GetRolesByUserIdAsync(long userId);

        Task UpdateUserRolesAsync(long userId, IEnumerable<string> roleCodes);

        Task<(IEnumerable<UserDomain> Items, int TotalCount)> SearchAsync(
            string? keyword,
            string? roleCode,
            bool? isActive,
            int pageNumber,
            int pageSize);
    }
}