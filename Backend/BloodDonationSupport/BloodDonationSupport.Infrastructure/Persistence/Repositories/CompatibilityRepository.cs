using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class CompatibilityRepository : ICompatibilityRepository
    {
        private readonly AppDbContext _context;

        public CompatibilityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CompatibilityRuleDomain>> GetRulesAsync(int recipientBloodTypeId, int componentId)
        {
            var rules = await _context.CompatibilityMatrix
                .Where(r =>
                    r.ToBloodTypeId == recipientBloodTypeId &&
                    r.ComponentId == componentId &&
                    r.IsCompatible == true)
                .Select(r => new CompatibilityRuleDomain(
                    r.FromBloodTypeId,
                    r.ToBloodTypeId,
                    r.ComponentId,
                    r.IsCompatible,
                    r.PriorityLevel ?? 0
                ))
                .ToListAsync();

            return rules;
        }
    }
}