using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonorsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<DonorsController> _logger;

        public DonorsController(IMediator mediator, ILogger<DonorsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // [GET] api/donors (Get all donors with pagination)
        [HttpGet]
        public async Task<IActionResult> GetDonorStatus([FromQuery] int pagenumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllDonorsQuery(pagenumber,pageSize));
            if(result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        // [GET] api/donors/{id} (Get donor by Id)
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetDonorById(long id)
        {
            var result = await _mediator.Send(new GetDonorByIdQuery(id));
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }
       
        // [POST] api/donors/register (Register a new donor)
        [HttpPost("register")]
        public async Task<IActionResult> RegisterDonor([FromBody] RegisterDonorRequest request)
        {
            var result = await _mediator.Send(new RegisterDonorCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
