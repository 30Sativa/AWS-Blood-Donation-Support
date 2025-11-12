using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetNearbyDonorsQuery(GetNearbyDonorsRequest Request) : IRequest<BaseResponse<List<NearbyDonorResponse>>>
    {
    }
}