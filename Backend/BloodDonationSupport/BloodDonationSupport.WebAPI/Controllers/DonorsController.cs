using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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

       

        

        // [POST] api/donors/register (Register a new donor)
        [HttpPost("register")]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<IActionResult> RegisterDonor([FromBody] RegisterDonorRequest request)
        {
            var result = await _mediator.Send(new RegisterDonorCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }



        [HttpPut("{id}/availability")]
        public async Task<IActionResult> UpdateAvailability(long id, UpdateAvailabilityRequest request)
        {
            request.DonorId = id;
            var result = await _mediator.Send(new UpdateAvailabilityCommand(request));
            return Ok(result);
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
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> SearchDonors([FromQuery] SearchDonorsRequest request)
        {
            var result = await _mediator.Send(new SearchDonorsQuery(request));
            return Ok(result);
        }


        // [PUT] api/donors/me (Update current user's donor profile)
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMyDonor([FromBody] UpdateDonorRequest request)
        {
            var result = await _mediator.Send(new UpdateMyDonorCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/donors/{id} (Update donor profile)
        [HttpPut("{id:long}")]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<IActionResult> UpdateDonor(long id, [FromBody] UpdateDonorRequest request)
        {
            var result = await _mediator.Send(new UpdateDonorCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }




        // [DELETE] api/donors/{id} (Delete donor)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonor(long id)
        {
            var result = await _mediator.Send(new DeleteDonorCommand(id));
            return Ok(result);
        }


        // [GET] api/donors/{id}/profile (Get donor profile by Id)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDonorProfile(long id)
        {
            var result = await _mediator.Send(new GetDonorProfileQuery(id));
            return Ok(result);
        }


        // [PUT] api/donors/{id}/location (Update donor location)
        [HttpPut("{id}/location")]
        public async Task<IActionResult> UpdateLocation(long id, UpdateDonorLocationRequest request)
        {
            request.DonorId = id;
            var result = await _mediator.Send(new UpdateDonorLocationCommand(request));
            return Ok(result);
        }

        // [PUT] api/donors/{id}/ready-status (Update donor ready status)
        [HttpPut("{id}/ready-status")]
        public async Task<IActionResult> UpdateReadyStatus(long id, UpdateReadyStatusRequest request)
        {
            request.DonorId = id;

            var result = await _mediator.Send(new UpdateReadyStatusCommand(request));
            return Ok(result);
        }

        // [PUT] api/donors/{id}/health-conditions (Update donor health conditions)
        [HttpPut("{id}/health-conditions")]
        public async Task<IActionResult> UpdateHealthConditions(long id, UpdateHealthConditionsRequest request)
        {
            request.DonorId = id;
            var result = await _mediator.Send(new UpdateHealthConditionsCommand(request));
            return Ok(result);
        }
    }
}