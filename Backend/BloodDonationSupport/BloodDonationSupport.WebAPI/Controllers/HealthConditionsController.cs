using BloodDonationSupport.Application.Features.References.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthConditionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public HealthConditionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllHealthConditions()
        {
            var result = await _mediator.Send(new GetAllHealthConditionsQuery());
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}