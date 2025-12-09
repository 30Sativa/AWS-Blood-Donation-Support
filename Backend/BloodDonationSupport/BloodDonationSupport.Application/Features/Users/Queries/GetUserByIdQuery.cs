using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetUserByIdQuery(long UserId) : IRequest<UserResponse>
    {
    }
}