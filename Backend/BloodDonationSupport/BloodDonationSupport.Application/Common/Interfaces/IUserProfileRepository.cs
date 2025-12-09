using BloodDonationSupport.Domain.Users.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserProfileRepository
    {
        Task<IEnumerable<UserProfileDomain>> GetAllAsync();

        Task<(IEnumerable<UserProfileDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<UserProfileDomain?> GetByIdAsync(object id);

        Task<IEnumerable<UserProfileDomain>> FindAsync(Expression<Func<UserProfileDomain, bool>> predicate);

        Task AddAsync(UserProfileDomain entity);

        void Update(UserProfileDomain entity);

        void Delete(UserProfileDomain entity);

        Task<bool> ExistsAsync(Expression<Func<UserProfileDomain, bool>> predicate);

        Task<IEnumerable<UserProfileDomain>> GetAllActiveProfilesAsync();

        Task<UserProfileDomain?> GetByUserIdAsync(long userId);
    }
}