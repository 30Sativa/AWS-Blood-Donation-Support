using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public record GetRequestByIdQuery(long RequestId) : IRequest<BaseResponse<RequestResponse>>
    {
    }
}