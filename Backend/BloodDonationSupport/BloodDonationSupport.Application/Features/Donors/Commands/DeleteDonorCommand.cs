using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record DeleteDonorCommand(long DonorId) : IRequest<BaseResponse<string>>
    {
    }
}