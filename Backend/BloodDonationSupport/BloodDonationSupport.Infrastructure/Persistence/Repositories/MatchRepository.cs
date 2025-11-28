using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class MatchRepository : IMatchRepository
    {
        private readonly AppDbContext _context;

        public MatchRepository(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // ADD (NO SaveChanges HERE!!!)
        // ============================================================
        public async Task<long> AddAsync(MatchData match)
        {
            var entity = new Match
            {
                RequestId = match.RequestId,
                DonorId = match.DonorId,
                CompatibilityScore = match.CompatibilityScore,
                DistanceKm = match.DistanceKm,
                Status = match.Status,
                ContactedAt = match.ContactedAt,
                Response = match.Response,
                CreatedAt = match.CreatedAt
            };

            await _context.Matches.AddAsync(entity);

            return entity.MatchId; // EF set sau SaveChangesAsync
        }



        // ============================================================
        // GET BY ID
        // ============================================================
        public async Task<MatchData?> GetByIdAsync(long matchId)
        {
            var entity = await _context.Matches
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MatchId == matchId);

            if (entity == null)
                return null;

            return new MatchData
            {
                MatchId = entity.MatchId,
                RequestId = entity.RequestId,
                DonorId = entity.DonorId,
                CompatibilityScore = entity.CompatibilityScore,
                DistanceKm = entity.DistanceKm,
                Status = entity.Status,
                ContactedAt = entity.ContactedAt,
                Response = entity.Response,
                CreatedAt = entity.CreatedAt
            };
        }

        // ============================================================
        // GET BY REQUEST ID
        // ============================================================
        public async Task<IEnumerable<MatchData>> GetByRequestIdAsync(long requestId)
        {
            var entities = await _context.Matches
                .AsNoTracking()
                .Where(m => m.RequestId == requestId)
                .ToListAsync();

            return entities.Select(e => new MatchData
            {
                MatchId = e.MatchId,
                RequestId = e.RequestId,
                DonorId = e.DonorId,
                CompatibilityScore = e.CompatibilityScore,
                DistanceKm = e.DistanceKm,
                Status = e.Status,
                ContactedAt = e.ContactedAt,
                Response = e.Response,
                CreatedAt = e.CreatedAt
            });
        }

        // ============================================================
        // GET BY DONOR ID
        // ============================================================
        public async Task<IEnumerable<MatchData>> GetByDonorIdAsync(long donorId)
        {
            var entities = await _context.Matches
                .AsNoTracking()
                .Where(m => m.DonorId == donorId)
                .ToListAsync();

            return entities.Select(e => new MatchData
            {
                MatchId = e.MatchId,
                RequestId = e.RequestId,
                DonorId = e.DonorId,
                CompatibilityScore = e.CompatibilityScore,
                DistanceKm = e.DistanceKm,
                Status = e.Status,
                ContactedAt = e.ContactedAt,
                Response = e.Response,
                CreatedAt = e.CreatedAt
            });
        }
    }
}
