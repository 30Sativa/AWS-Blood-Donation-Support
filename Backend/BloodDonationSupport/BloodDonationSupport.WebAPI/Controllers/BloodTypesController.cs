using BloodDonationSupport.Application.Features.References.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloodTypesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BloodTypesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBloodTypes()
        {
            var result = await _mediator.Send(new GetAllBloodTypesQuery());
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}

