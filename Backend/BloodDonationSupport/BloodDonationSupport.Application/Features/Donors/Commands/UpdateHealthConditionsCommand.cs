using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record UpdateHealthConditionsCommand(UpdateHealthConditionsRequest Request)
    : IRequest<BaseResponse<string>>
    {
    }
}