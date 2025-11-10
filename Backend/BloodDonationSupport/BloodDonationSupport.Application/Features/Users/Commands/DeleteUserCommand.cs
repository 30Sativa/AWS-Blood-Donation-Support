using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record DeleteUserCommand(long userId) : IRequest<BaseResponse<string>>
    {
    }
}