using BloodDonationSupport.Application.Features.Requests.Commands;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using BloodDonationSupport.Application.Features.Requests.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<RequestsController> _logger;

        public RequestsController(IMediator mediator, ILogger<RequestsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // =====================================================
        // [GET] api/requests (get all requests with pagination)
        // =====================================================
        [HttpGet]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> GetAllRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllRequestsQuery(pageNumber, pageSize));
            return result == null ? NotFound() : Ok(result);    
        }

        // =====================================================
        // [GET] api/requests/{id} (get single request by ID)
        // =====================================================
        [HttpGet("{id:long}")]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<IActionResult> GetRequestById(long id)
        {
            var result = await _mediator.Send(new GetRequestByIdQuery(id));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // =====================================================
        // [POST] api/requests/register (register new request)
        // =====================================================
        [HttpPost("register")]
        [Authorize(Policy = "UserOrAdmin")]
        public async Task<IActionResult> RegisterRequest([FromBody] RegisterRequest request)
        {
            if (request == null)
                return BadRequest("Request body cannot be null.");

            var result = await _mediator.Send(new RegisterRequestCommand(request));

            if (!result.Success)
            {
                _logger.LogWarning("❌ RegisterRequest failed: {Message}", result.Message);
                return BadRequest(result);
            }

            return Ok(result);
        }

        // =====================================================
        // [PUT] api/requests/{id}/status (update request status)
        // =====================================================
        [HttpPut("{id:long}/status")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> UpdateRequestStatus(long id, [FromBody] UpdateRequestStatusRequest request)
        {
            if (request == null)
                return BadRequest("Request body cannot be null.");

            var result = await _mediator.Send(new UpdateRequestStatusCommand(id,request));

            if (!result.Success)
            {
                _logger.LogWarning("❌ UpdateStatus failed for RequestId={Id}: {Message}", id, result.Message);
                return BadRequest(result);
            }

            _logger.LogInformation("🔄 Request {Id} updated to {Status}", id, request.NewStatus);
            return Ok(result);
        }

        // =====================================================
        // [GET] api/requests/nearby (find nearby blood requests)
        // =====================================================
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyRequests([FromQuery]GetNearbyRequestsRequest request)
        {
            var result = await _mediator.Send(new GetNearbyRequestsQuery(request));
            return result == null ? NotFound() : Ok(result);
        }
    }
}