using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using BloodDonationSupport.Domain.Matches.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

public class MatchRepository : IMatchRepository
{
    private readonly AppDbContext _context;

    public MatchRepository(AppDbContext context)
    {
        _context = context;
    }

    // =============================================================
    // DOMAIN SECTION
    // =============================================================
    public async Task AddDomainAsync(MatchDomain match)
    {
        var ef = new Match
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

        await _context.Matches.AddAsync(ef);

        match.SetId(ef.MatchId);
    }

    public async Task<MatchDomain?> GetDomainByIdAsync(long matchId)
    {
        var ef = await _context.Matches.FirstOrDefaultAsync(m => m.MatchId == matchId);

        return ef == null
            ? null
            : MatchDomain.Rehydrate(
                ef.MatchId,
                ef.RequestId,
                ef.DonorId,
                ef.CompatibilityScore,
                ef.DistanceKm,
                ef.Status,
                ef.ContactedAt,
                ef.Response,
                ef.CreatedAt
            );
    }

    public void UpdateDomain(MatchDomain match)
    {
        var ef = _context.Matches.First(m => m.MatchId == match.Id);

        ef.Status = match.Status;
        ef.ContactedAt = match.ContactedAt;
        ef.Response = match.Response;
    }

    // =============================================================
    // DTO SECTION (CreateMatch & Queries)
    // =============================================================
    public async Task<MatchData?> GetDtoByRequestIdAndDonorIdAsync(long requestId, long donorId)
    {
        var ef = await _context.Matches
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.RequestId == requestId && m.DonorId == donorId);

        return ef == null ? null : ToMatchData(ef);
    }

    public async Task<IEnumerable<MatchData>> GetDtosByRequestIdAsync(long requestId)
    {
        return await _context.Matches
            .AsNoTracking()
            .Where(m => m.RequestId == requestId)
            .Select(x => ToMatchData(x))
            .ToListAsync();
    }

    public async Task<IEnumerable<MatchData>> GetDtosByDonorIdAsync(long donorId)
    {
        return await _context.Matches
            .AsNoTracking()
            .Where(m => m.DonorId == donorId)
            .Select(x => ToMatchData(x))
            .ToListAsync();
    }

    public async Task<long> AddDtoAsync(MatchData match)
    {
        var ef = new Match
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

        await _context.Matches.AddAsync(ef);

        return ef.MatchId;
    }

    public void UpdateDto(MatchData match)
    {
        var ef = _context.Matches.First(x => x.MatchId == match.MatchId);
        ef.Status = match.Status;
        ef.ContactedAt = match.ContactedAt;
        ef.Response = match.Response;
    }

    // =============================================================
    // Mapping helper
    // =============================================================
    private static MatchData ToMatchData(Match ef)
    {
        return new MatchData
        {
            MatchId = ef.MatchId,
            RequestId = ef.RequestId,
            DonorId = ef.DonorId,
            CompatibilityScore = ef.CompatibilityScore,
            DistanceKm = ef.DistanceKm,
            Status = ef.Status,
            ContactedAt = ef.ContactedAt,
            Response = ef.Response,
            CreatedAt = ef.CreatedAt
        };
    }
}
