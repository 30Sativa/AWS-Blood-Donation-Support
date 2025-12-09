using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetDonorProfileQuery(long DonorId)
    : IRequest<BaseResponse<DonorProfileResponse>>;
}