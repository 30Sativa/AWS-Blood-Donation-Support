using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetAllUsersQuery() : IRequest<IEnumerable<UserResponse>>
    {
    }
}