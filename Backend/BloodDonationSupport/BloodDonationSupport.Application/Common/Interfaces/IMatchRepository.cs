using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using System.Text.RegularExpressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        Task<Match> AddAsync(MatchData match);

        Task<MatchData?> GetByIdAsync(long matchId);

        Task<IEnumerable<MatchData>> GetByRequestIdAsync(long requestId);

        Task<IEnumerable<MatchData>> GetByDonorIdAsync(long donorId);
    }
}