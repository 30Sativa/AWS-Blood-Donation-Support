using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Queries
{
    public class GetAllMatchesHandler
        : IRequestHandler<GetAllMatchesQuery, BaseResponse<IEnumerable<MatchData>>>
    {
        private readonly IMatchRepository _matchRepo;

        public GetAllMatchesHandler(IMatchRepository matchRepo)
        {
            _matchRepo = matchRepo;
        }

        public async Task<BaseResponse<IEnumerable<MatchData>>> Handle(
            GetAllMatchesQuery request,
            CancellationToken cancellationToken)
        {
            var matches = await _matchRepo.GetAllDtosAsync();

            return BaseResponse<IEnumerable<MatchData>>
                .SuccessResponse(matches, "Matches retrieved successfully.");
        }
    }
}
