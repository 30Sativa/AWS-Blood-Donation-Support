using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetMatchesByRequestIdHandler
        : IRequestHandler<GetMatchesByRequestIdQuery, BaseResponse<IEnumerable<MatchData>>>
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IRequestRepository _requestRepository;

        public GetMatchesByRequestIdHandler(
            IMatchRepository matchRepository,
            IRequestRepository requestRepository)
        {
            _matchRepository = matchRepository;
            _requestRepository = requestRepository;
        }

        public async Task<BaseResponse<IEnumerable<MatchData>>> Handle(
            GetMatchesByRequestIdQuery query,
            CancellationToken cancellationToken)
        {
            // 1. Check request tồn tại
            var request = await _requestRepository.GetByIdAsync(query.RequestId);
            if (request == null)
                return BaseResponse<IEnumerable<MatchData>>.FailureResponse("Request not found.");

            // 2. Lấy danh sách matches
            var matches = await _matchRepository.GetDtosByRequestIdAsync(query.RequestId);

            return BaseResponse<IEnumerable<MatchData>>
                .SuccessResponse(matches, "Matches retrieved successfully.");
        }
    }
}
