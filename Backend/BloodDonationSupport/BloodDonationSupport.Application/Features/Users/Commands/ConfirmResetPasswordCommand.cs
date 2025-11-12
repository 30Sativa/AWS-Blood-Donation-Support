using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record ConfirmResetPasswordCommand(ConfirmResetPasswordRequest Request) : IRequest<BaseResponse<string>>
    {
    }
}