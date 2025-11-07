using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record ConfirmResetPasswordCommand(ConfirmResetPasswordRequest Request) : IRequest<BaseResponse<string>>
    {
    }
}
