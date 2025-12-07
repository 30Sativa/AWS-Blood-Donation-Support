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
    public record GetMatchesByRequestIdQuery(long RequestId) : IRequest<BaseResponse<IEnumerable<MatchData>>>
    {

    }
}
