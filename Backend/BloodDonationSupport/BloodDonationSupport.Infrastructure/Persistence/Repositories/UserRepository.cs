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
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(UserDomain domainEntity)
        {
            var entity = new User
            {
                Email = domainEntity.Email.Value,
                CognitoUserId = domainEntity.CognitoUserId,
                PhoneNumber = domainEntity.PhoneNumber,
                IsActive = domainEntity.IsActive,
                CreatedAt = domainEntity.CreateAt,
            };
            await _context.Users.AddAsync(entity);
        }

        public void Delete(UserDomain entity)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ExistsAsync(Expression<Func<UserDomain, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserDomain>> FindAsync(Expression<Func<UserDomain, bool>> predicate)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserDomain>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<UserDomain?> GetByEmailAsync(string email)
        {
            var entity = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if(entity == null)
            {
                return null;
            }
            return UserDomain.Rehydrate(
                entity.UserId,
                new Domain.Users.ValueObjects.Email(entity.Email),
                entity.CognitoUserId ?? string.Empty,
                entity.PhoneNumber,
                entity.IsActive,
                entity.CreatedAt
            );
        }

        public Task<UserDomain?> GetByIdAsync(object id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> IsExistEmailAsync(string email)
        {
            await _context.Users.FirstOrDefaultAsync(u => u.Email == email); return true;
        }

        public void Update(UserDomain entity)
        {
            throw new NotImplementedException();
        }
    }
}
