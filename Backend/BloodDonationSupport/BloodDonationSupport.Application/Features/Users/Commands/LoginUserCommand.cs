using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record LoginUserCommand(LoginUserRequest request) : IRequest<BaseResponse<LoginResponse>>
    {
    }
}