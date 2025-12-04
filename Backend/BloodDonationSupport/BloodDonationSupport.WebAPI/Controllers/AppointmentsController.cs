using BloodDonationSupport.Application.Features.Appointments.Commands;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AppointmentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            var result = await _mediator.Send(new CreateAppointmentCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(long id, [FromBody] UpdateAppointmentStatusRequest request)
        {
            var result = await _mediator.Send(new UpdateAppointmentStatusCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}