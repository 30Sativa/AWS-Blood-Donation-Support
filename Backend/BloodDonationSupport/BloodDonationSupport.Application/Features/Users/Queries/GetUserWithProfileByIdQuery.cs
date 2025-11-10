using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetUserWithProfileByIdQuery(long UserId) : IRequest<BaseResponse<UserWithProfileResponse>>
    {
    }
}