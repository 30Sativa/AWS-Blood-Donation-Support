using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly AppDbContext _context;

        public UserProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        //  Add profile
        public async Task AddAsync(UserProfileDomain domainEntity)
        {
            var entity = new UserProfile
            {
                UserId = domainEntity.UserId,
                FullName = domainEntity.FullName,
                BirthYear = domainEntity.BirthYear,
                Gender = domainEntity.Gender,
                PrivacyPhoneVisibleToStaffOnly = domainEntity.PrivacyPhoneVisibleToStaffOnly,
                CreatedAt = DateTime.UtcNow
            };

            await _context.UserProfiles.AddAsync(entity);
            // Không SaveChanges ở đây, để UnitOfWork xử lý
        }

        //  Get by Id
        public async Task<UserProfileDomain?> GetByIdAsync(object id)
        {
            if (id is not long userId)
                return null;

            return await GetByUserIdAsync(userId);
        }

        //  Get by UserId
        public async Task<UserProfileDomain?> GetByUserIdAsync(long userId)
        {
            var up = await _context.UserProfiles.AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (up == null) return null;

            return UserProfileDomain.Rehydrate(
                up.UserId,
                up.FullName,
                up.BirthYear,
                up.Gender,
                up.PrivacyPhoneVisibleToStaffOnly
            );
        }

        //  Get all profiles
        public async Task<IEnumerable<UserProfileDomain>> GetAllAsync()
        {
            return await _context.UserProfiles
                .AsNoTracking()
                .Select(up => UserProfileDomain.Rehydrate(
                    up.UserId,
                    up.FullName,
                    up.BirthYear,
                    up.Gender,
                    up.PrivacyPhoneVisibleToStaffOnly
                ))
                .ToListAsync();
        }

        //  Get all active (PrivacyPhoneVisibleToStaffOnly == true)
        public async Task<IEnumerable<UserProfileDomain>> GetAllActiveProfilesAsync()
        {
            return await _context.UserProfiles
                .AsNoTracking()
                .Where(up => up.PrivacyPhoneVisibleToStaffOnly == true)
                .Select(up => UserProfileDomain.Rehydrate(
                    up.UserId,
                    up.FullName,
                    up.BirthYear,
                    up.Gender,
                    up.PrivacyPhoneVisibleToStaffOnly
                ))
                .ToListAsync();
        }

        //  Update profile (EF tracking)
        public void Update(UserProfileDomain domainEntity)
        {
            var entity = _context.UserProfiles.FirstOrDefault(up => up.UserId == domainEntity.UserId);
            if (entity == null) return;

            entity.FullName = domainEntity.FullName;
            entity.BirthYear = domainEntity.BirthYear;
            entity.Gender = domainEntity.Gender;
            entity.PrivacyPhoneVisibleToStaffOnly = domainEntity.PrivacyPhoneVisibleToStaffOnly;

            _context.UserProfiles.Update(entity);
        }

        //  Exists check
        public async Task<bool> ExistsAsync(Expression<Func<UserProfileDomain, bool>> predicate)
        {
            return await _context.UserProfiles.AnyAsync(p => predicate.Compile().Invoke(
            UserProfileDomain.Rehydrate(p.UserId, p.FullName, p.BirthYear, p.Gender, p.PrivacyPhoneVisibleToStaffOnly)));
        }

        //  Find (optional)
        public async Task<IEnumerable<UserProfileDomain>> FindAsync(Expression<Func<UserProfileDomain, bool>> predicate)
        {
            var profiles = await GetAllAsync();
            return profiles.AsQueryable().Where(predicate.Compile()).ToList();
        }

        public void Delete(UserProfileDomain entity)
        {
            var profile = _context.UserProfiles.FirstOrDefault(up => up.UserId == entity.UserId);
            if (profile != null)
                _context.UserProfiles.Remove(profile);
        }

        // Optional update return
        public async Task<UserProfileDomain?> UpdateProfile(UserProfileDomain domainEntity)
        {
            var existing = await _context.UserProfiles.FirstOrDefaultAsync(up => up.UserId == domainEntity.UserId);
            if (existing == null)
                return null;

            existing.FullName = domainEntity.FullName;
            existing.BirthYear = domainEntity.BirthYear;
            existing.Gender = domainEntity.Gender;
            existing.PrivacyPhoneVisibleToStaffOnly = domainEntity.PrivacyPhoneVisibleToStaffOnly;

            _context.UserProfiles.Update(existing);
            return domainEntity;
        }
    }
}