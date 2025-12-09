using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public record DeclineMatchCommand(long MatchId) : IRequest<BaseResponse<string>>
    {
    }
}
