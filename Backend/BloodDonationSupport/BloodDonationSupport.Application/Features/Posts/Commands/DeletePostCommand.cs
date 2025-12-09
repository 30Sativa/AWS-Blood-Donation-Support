using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record DeletePostCommand(long id) : IRequest<BaseResponse<bool>>
    {
    }
}