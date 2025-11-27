using BloodDonationSupport.Application.Features.Requests.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        Task<long> AddAsync(MatchData match);

        Task<MatchData?> GetByIdAsync(long matchId);

        Task<IEnumerable<MatchData>> GetByRequestIdAsync(long requestId);

        Task<IEnumerable<MatchData>> GetByDonorIdAsync(long donorId);
    }
}