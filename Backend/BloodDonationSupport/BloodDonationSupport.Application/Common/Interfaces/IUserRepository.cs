using BloodDonationSupport.Domain.Users.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserDomain>> GetAllAsync();

        Task<(IEnumerable<UserDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<UserDomain?> GetByIdAsync(object id);

        Task<IEnumerable<UserDomain>> FindAsync(Expression<Func<UserDomain, bool>> predicate);

        Task AddAsync(UserDomain entity);

        void Update(UserDomain entity);

        void Delete(UserDomain entity);

        Task<bool> ExistsAsync(Expression<Func<UserDomain, bool>> predicate);

        Task<bool> IsExistEmailAsync(string email);

        Task<UserDomain?> GetByEmailAsync(string email);

        Task<UserDomain?> GetByEmailWithRolesAsync(string email);

        Task AssignDefaultRoleAsync(long userId);

        Task AssignRoleAsync(long userId, string roleCode);

        Task<long> GetUserIdByEmailAsync(string email);

        Task<UserDomain?> GetByCognitoUserIdAsync(string cognitoUserId);

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