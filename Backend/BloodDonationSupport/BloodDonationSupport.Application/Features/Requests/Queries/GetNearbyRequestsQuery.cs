using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public record GetNearbyRequestsQuery(GetNearbyRequestsRequest request)
        : IRequest<BaseResponse<IEnumerable<NearbyRequestResponse>>>;
}