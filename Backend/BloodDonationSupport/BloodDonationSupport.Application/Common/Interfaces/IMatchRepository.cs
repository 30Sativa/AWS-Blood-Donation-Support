using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Matches.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        // ======================
        // DOMAIN (for update status)
        // ======================
        Task<MatchDomain?> GetDomainByIdAsync(long matchId);
        Task AddDomainAsync(MatchDomain match);
        void UpdateDomain(MatchDomain match);

        // ======================
        // DTO (for CreateMatch & Queries)
        // ======================
        Task<long> AddDtoAsync(MatchData match);
        Task<MatchData?> GetDtoByIdAsync(long matchId);
        Task<MatchData?> GetDtoByRequestIdAndDonorIdAsync(long requestId, long donorId);
        Task<IEnumerable<MatchData>> GetDtosByRequestIdAsync(long requestId);
        Task<IEnumerable<MatchData>> GetDtosByDonorIdAsync(long donorId);
        void UpdateDto(MatchData match);
    }
}