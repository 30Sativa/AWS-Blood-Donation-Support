using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Request;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Appointments.Commands
{
    public record CreateAppointmentCommand(CreateAppointmentRequest Request) : IRequest<BaseResponse<AppointmentResponse>>
    {
    }
}
