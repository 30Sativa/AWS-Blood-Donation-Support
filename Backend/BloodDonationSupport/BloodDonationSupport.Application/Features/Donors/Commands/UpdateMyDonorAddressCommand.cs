using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record UpdateMyDonorAddressCommand(UpdateMyAddressRequest Request) : IRequest<BaseResponse<string>>
    {
    }
}
