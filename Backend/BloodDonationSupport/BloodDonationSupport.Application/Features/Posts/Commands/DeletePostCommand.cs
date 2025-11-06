using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record DeletePostCommand(long id): IRequest<BaseResponse<bool>>
    {
    }
}
