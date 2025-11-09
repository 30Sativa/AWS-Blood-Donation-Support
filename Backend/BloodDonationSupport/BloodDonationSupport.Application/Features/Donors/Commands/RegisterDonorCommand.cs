using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record RegisterDonorCommand(RegisterDonorRequest request) : IRequest<BaseResponse<RegisterDonorResponse>>
    {
    }
}
