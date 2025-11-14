using BloodDonationSupport.Domain.Users.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserProfileRepository : IGenericRepository<UserProfileDomain>
    {
        Task<IEnumerable<UserProfileDomain>> GetAllActiveProfilesAsync();
        Task<UserProfileDomain?> GetByUserIdAsync(long userId);
    }
}