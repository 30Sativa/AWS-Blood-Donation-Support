using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Domain.Users.ValueObjects;
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
                CreatedAt = domainEntity.CreatedAt,
            };
            await _context.Users.AddAsync(entity);
            // Note: Don't SaveChanges here - let UnitOfWork manage it
            // The UserId will be set after SaveChangesAsync is called
        }

        public async Task<long> GetUserIdByEmailAsync(string email)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            return user?.UserId ?? 0;
        }

        public async Task AssignDefaultRoleAsync(long userId)
        {
            // Get User entity to ensure it's tracked
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception($"User with ID {userId} not found.");

            var defaultRole = await _context.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RoleCode == "MEMBER");

            if (defaultRole == null)
                throw new Exception("Default role 'MEMBER' not found. Please seed it first.");

            // Use navigation property approach to let EF Core handle the relationship
            var userRole = new UserRole
            {
                User = user,
                RoleId = defaultRole.RoleId
            };
            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();
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

        public async Task<UserDomain?> GetByEmailWithRolesAsync(string email)
        {
            var entity = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (entity == null)
                return null;

            var roles = entity.UserRoles.Select(ur => ur.Role.RoleCode).ToList();

            return UserDomain.RehydrateWithRoles(
                entity.UserId,
                new Domain.Users.ValueObjects.Email(entity.Email),
                entity.CognitoUserId ?? string.Empty,
                entity.PhoneNumber,
                entity.IsActive,
                entity.CreatedAt,
                roles
            );
        }


        public async Task<UserDomain?> GetByIdAsync(object id)
        {
            if (id is long userId)
            {
                var entity = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == userId);
                if (entity == null)
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
            return null;
        }

        public async Task<bool> IsExistEmailAsync(string email)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);

            Console.WriteLine($"[Repo] Checking email {email} -> found: {user != null}");
            return user != null;
        }

        public void Update(UserDomain entity)
        {
            throw new NotImplementedException();
        }

        public Task AssignRoleAsync(long userId, string roleCode)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<string>> GetRolesByUserIdAsync(long userId)
        {
            throw new NotImplementedException();
        }
    }
}
