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
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(IMediator mediator, ILogger<AppointmentsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // [POST] api/appointments (Create appointment between donor and request)
        [HttpPost]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            if (request == null)
                return BadRequest("Request body cannot be null.");

            var result = await _mediator.Send(new CreateAppointmentCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}