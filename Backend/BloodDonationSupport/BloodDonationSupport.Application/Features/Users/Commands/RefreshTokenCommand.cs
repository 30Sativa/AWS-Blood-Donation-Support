using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record RefreshTokenCommand(string RefreshToken) : IRequest<BaseResponse<AuthTokens>>
    {
    }
}