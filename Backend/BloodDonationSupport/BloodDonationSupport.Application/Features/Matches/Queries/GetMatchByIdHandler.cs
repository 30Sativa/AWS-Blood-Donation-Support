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
    public class GetMatchByIdHandler
        : IRequestHandler<GetMatchByIdQuery, BaseResponse<MatchData>>
    {
        private readonly IMatchRepository _matchRepo;

        public GetMatchByIdHandler(IMatchRepository matchRepo)
        {
            _matchRepo = matchRepo;
        }

        public async Task<BaseResponse<MatchData>> Handle(
            GetMatchByIdQuery query,
            CancellationToken cancellationToken)
        {
            var matchDomain = await _matchRepo.GetDomainByIdAsync(query.MatchId);
            if (matchDomain == null)
                return BaseResponse<MatchData>.FailureResponse("Match not found.");

            // Convert domain to DTO
            var dto = new MatchData
            {
                MatchId = matchDomain.Id,
                RequestId = matchDomain.RequestId,
                DonorId = matchDomain.DonorId,
                CompatibilityScore = matchDomain.CompatibilityScore,
                DistanceKm = matchDomain.DistanceKm,
                Status = matchDomain.Status,
                ContactedAt = matchDomain.ContactedAt,
                Response = matchDomain.Response,
                CreatedAt = matchDomain.CreatedAt
            };

            return BaseResponse<MatchData>.SuccessResponse(dto);
        }
    }
}
