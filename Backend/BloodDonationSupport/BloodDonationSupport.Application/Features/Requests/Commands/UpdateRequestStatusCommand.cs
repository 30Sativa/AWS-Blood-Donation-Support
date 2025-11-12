using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public record UpdateRequestStatusCommand(UpdateRequestStatusRequest request) : IRequest<BaseResponse<string>>
    {
    }
}
