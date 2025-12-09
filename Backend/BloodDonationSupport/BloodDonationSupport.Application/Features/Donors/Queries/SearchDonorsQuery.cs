using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record SearchDonorsQuery(SearchDonorsRequest Request)
    : IRequest<PaginatedResponse<DonorResponse>>;
}