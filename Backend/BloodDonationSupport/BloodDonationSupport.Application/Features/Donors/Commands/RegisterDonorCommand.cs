using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record RegisterDonorCommand(RegisterDonorRequest request) : IRequest<BaseResponse<RegisterDonorResponse>>
    {
    }
}