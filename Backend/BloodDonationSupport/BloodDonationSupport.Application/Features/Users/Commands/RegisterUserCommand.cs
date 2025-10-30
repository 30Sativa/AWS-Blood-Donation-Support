using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record RegisterUserCommand : IRequest<BaseResponse<UserResponse>>
    {
        public RegisterUserRequest request { get; }

        public RegisterUserCommand(RegisterUserRequest Request)
        {
            this.request = request;
        }
    }
}
