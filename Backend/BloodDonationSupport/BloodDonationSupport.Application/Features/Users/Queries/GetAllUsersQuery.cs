using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetAllUsersQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedResponse<UserResponse>>
    {
    }
}