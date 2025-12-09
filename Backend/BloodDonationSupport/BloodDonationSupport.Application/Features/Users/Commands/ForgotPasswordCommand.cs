using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record ForgotPasswordCommand(string Email) : IRequest<BaseResponse<string>>
    {
    }
}