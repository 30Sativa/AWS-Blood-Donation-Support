using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Roles.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class RoleRepository : IRoleRepository
    {

        private readonly AppDbContext _context;
        

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<RoleDomain>> GetAllAsync()
        {
            var roles = await _context.Roles.ToListAsync();
            return roles.Select(r => RoleDomain.Rehydrate(
                r.RoleId,
                r.RoleCode,
                r.RoleName
            ));
        }

        public async Task<RoleDomain?> GetByCodeAsync(string code)
        {
            var entity = await _context.Roles
                .Where(r => r.RoleCode == code)
                .Select(r => RoleDomain.Rehydrate(
                    r.RoleId,
                    r.RoleCode,
                    r.RoleName
                ))
                .FirstOrDefaultAsync();
            return entity == null ? null : RoleDomain.Rehydrate(
                entity.Id,
                entity.Code,
                entity.Name
            );
        }
    }
}
