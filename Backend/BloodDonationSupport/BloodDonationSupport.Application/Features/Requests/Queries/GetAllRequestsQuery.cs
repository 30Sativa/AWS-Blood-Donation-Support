using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public record GetAllRequestsQuery(int PageNumber, int PageSize = 10) : IRequest<PaginatedResponse<RequestResponse>>
    {
    }
}