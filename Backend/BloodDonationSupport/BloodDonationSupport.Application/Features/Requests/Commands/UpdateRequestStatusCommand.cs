using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public record UpdateRequestStatusCommand(long requestid,UpdateRequestStatusRequest request) : IRequest<BaseResponse<string>>
    {
    }
}