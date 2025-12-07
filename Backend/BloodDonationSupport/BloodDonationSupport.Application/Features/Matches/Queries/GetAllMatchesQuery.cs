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
    public record GetAllMatchesQuery : IRequest<BaseResponse<IEnumerable<MatchData>>>
    {
    }

    public record GetMyMatchesQuery : IRequest<BaseResponse<IEnumerable<MatchData>>>
    {
    }
}
