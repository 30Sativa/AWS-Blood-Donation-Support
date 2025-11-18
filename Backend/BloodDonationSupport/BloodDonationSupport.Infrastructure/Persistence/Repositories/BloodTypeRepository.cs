using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.References.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class BloodTypeRepository : IBloodTypeRepository
    {
        private readonly AppDbContext _context;

        public BloodTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BloodTypeData>> GetAllAsync()
        {
            var bloodTypes = await _context.BloodTypes
                .AsNoTracking()
                .OrderBy(bt => bt.BloodTypeId)
                .ToListAsync();

            return bloodTypes.Select(bt => new BloodTypeData
            {
                Id = bt.BloodTypeId,
                Abo = bt.Abo,
                Rh = bt.Rh
            });
        }
    }
}

