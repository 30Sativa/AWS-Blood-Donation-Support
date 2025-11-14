using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.Queries;
using MediatR;
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
            var result = await _mediator.Send(new GetAllDonorsQuery(pagenumber, pageSize));
            if (result == null)
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

        // [PUT] api/donors/{id}/availability (Update donor availability)
        [HttpPut("{id:long}/availability")]
        public async Task<IActionResult> UpdateAvailability(long id, [FromBody] UpdateAvailabilityRequest request)
        {
            var result = await _mediator.Send(new UpdateAvailabilityCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/donors/{id}/ready-status (Update donor ready status)
        [HttpPut("{id:long}/ready-status")]
        public async Task<IActionResult> UpdateReadyStatus(long id, [FromBody] UpdateReadyStatusRequest request)
        {
            request.DonorId = id;
            var result = await _mediator.Send(new UpdateReadyStatusCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [GET] api/donors/nearby (Get nearby donors)
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyDonors([FromQuery] GetNearbyDonorsRequest request)
        {
            var result = await _mediator.Send(new GetNearbyDonorsQuery(request));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [GET] api/donors/search (Search donors with filters)
        [HttpGet("search")]
        public async Task<IActionResult> SearchDonors([FromQuery] SearchDonorsRequest request)
        {
            var result = await _mediator.Send(new SearchDonorsQuery(request));
            return Ok(result);
        }

        // [GET] api/donors/user/{userId} (Get donor by user ID)
        [HttpGet("user/{userId:long}")]
        public async Task<IActionResult> GetDonorByUserId(long userId)
        {
            var result = await _mediator.Send(new GetDonorByUserIdQuery(userId));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [PUT] api/donors/{id} (Update donor profile)
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateDonor(long id, [FromBody] UpdateDonorRequest request)
        {
            var result = await _mediator.Send(new UpdateDonorCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/donors/{id}/location (Update donor location)
        [HttpPut("{id:long}/location")]
        public async Task<IActionResult> UpdateDonorLocation(long id, [FromBody] UpdateDonorLocationRequest request)
        {
            var result = await _mediator.Send(new UpdateDonorLocationCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [DELETE] api/donors/{id} (Delete donor)
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteDonor(long id)
        {
            var result = await _mediator.Send(new DeleteDonorCommand(id));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}