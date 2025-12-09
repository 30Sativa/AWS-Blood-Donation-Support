using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using BloodDonationSupport.Domain.Matches.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        // Domain
        Task AddDomainAsync(MatchDomain match);
        Task<MatchDomain?> GetDomainByIdAsync(long matchId);
        void UpdateDomain(MatchDomain match);

        // DTO
        Task<MatchData?> GetDtoByRequestIdAndDonorIdAsync(long requestId, long donorId);
        Task<IEnumerable<MatchData>> GetDtosByRequestIdAsync(long requestId);
        Task<IEnumerable<MatchData>> GetDtosByDonorIdAsync(long donorId);
        Task<IEnumerable<MatchData>> GetDtosByUserIdAsync(long userId);
        Task<IEnumerable<MatchData>> GetAllDtosAsync();

        Task<long> AddDtoAsync(MatchData match);
        void UpdateDto(MatchData match);
    }
}