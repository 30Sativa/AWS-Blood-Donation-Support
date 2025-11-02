using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly AppDbContext _context;

        public UserProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(UserProfileDomain domainEntity)
        {
            var entity = new UserProfile
            {
                UserId = domainEntity.UserId,
                FullName = domainEntity.FullName,
                Gender = domainEntity.Gender,
                BirthYear = domainEntity.BirthYear,
                PrivacyPhoneVisibleToStaffOnly = domainEntity.PrivacyPhoneVisibleToStaffOnly,
                CreatedAt = domainEntity.CreatedOn // CreatedOn từ BaseEntity
            };
            await _context.UserProfiles.AddAsync(entity);
            // Note: Don't SaveChanges here - let UnitOfWork manage it
            // CreatedAt có default value SYSUTCDATETIME() trong DB, nhưng set để nhất quán
        }

        public void Delete(UserProfileDomain entity)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ExistsAsync(Expression<Func<UserProfileDomain, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserProfileDomain>> FindAsync(Expression<Func<UserProfileDomain, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserProfileDomain>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<UserProfileDomain?> GetByIdAsync(object id)
        {
            throw new NotImplementedException();
        }

        public void Update(UserProfileDomain entity)
        {
            throw new NotImplementedException();
        }
    }
}
