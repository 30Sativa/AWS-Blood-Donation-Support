using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.References.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class HealthConditionRepository : IHealthConditionRepository
    {
        private readonly AppDbContext _context;

        public HealthConditionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HealthConditionData>> GetAllAsync()
        {
            var conditions = await _context.HealthConditions
                .AsNoTracking()
                .OrderBy(c => c.ConditionName)
                .ToListAsync();

            return conditions.Select(c => new HealthConditionData
            {
                Id = c.ConditionId,
                Code = c.ConditionCode,
                Name = c.ConditionName,
                IsDonationEligible = c.IsDonationEligible
            });
        }
    }
}