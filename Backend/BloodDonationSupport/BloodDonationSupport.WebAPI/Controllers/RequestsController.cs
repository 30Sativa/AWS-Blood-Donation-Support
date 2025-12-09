using BloodDonationSupport.Application.Common.Interfaces;
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
        private readonly IUserRepository _userRepository;
        public RequestsController(IMediator mediator, ILogger<RequestsController> logger, IUserRepository userRepository)
        {
            _mediator = mediator;
            _logger = logger;
            _userRepository = userRepository;
        }

        // =====================================================
        // [GET] api/requests (get all requests with pagination)
        // =====================================================
        [HttpGet]

        public async Task<IActionResult> GetAllRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllRequestsQuery(pageNumber, pageSize));
            return result == null ? NotFound() : Ok(result);
        }

        // =====================================================
        // [GET] api/requests/{id} (get single request by ID)
        // =====================================================
        [HttpGet("{id:long}")]

        public async Task<IActionResult> GetRequestById(long id)
        {
            var result = await _mediator.Send(new GetRequestByIdQuery(id));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // =====================================================
        // [POST] api/requests/register (register new request)
        // =====================================================
        [HttpPost("register")]
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
        public async Task<IActionResult> UpdateRequestStatus(long id, [FromBody] UpdateRequestStatusRequest request)
        {
            if (request == null)
                return BadRequest("Request body cannot be null.");

            var result = await _mediator.Send(new UpdateRequestStatusCommand(id, request));

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
        public async Task<IActionResult> GetNearbyRequests([FromQuery] GetNearbyRequestsRequest request)
        {
            var result = await _mediator.Send(new GetNearbyRequestsQuery(request));
            return result == null ? NotFound() : Ok(result);
        }

        // =====================================================
        // [GET] api/requests/{id}/compatible-donors (get compatible donors for a request)
        // =====================================================
        [HttpGet("{id}/compatible-donors")]
        public async Task<IActionResult> GetCompatibleDonors(long id)
        {
            var response = await _mediator.Send(new GetCompatibleDonorsQuery(id));
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        // [GET] api/requests/me (get my requests)
        // =====================================================
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyRequests()
        {
            var result = await _mediator.Send(new GetMyRequestsQuery());
            return Ok(result);
        }

        // [GET] api/requests/user/{userId} (get requests by user ID)
        [HttpGet("user/{userId:long}")]
        public async Task<IActionResult> GetRequestsByUserId(long userId)
        {
            var result = await _mediator.Send(new GetRequestsByUserIdQuery(userId));
            return Ok(result);
        }
        // =====================================================
        // [PUT] api/requests/{id}/cancel  (cancel a request)
        // =====================================================
        [HttpPut("{id:long}/cancel")]
        public async Task<IActionResult> CancelRequest(CancelRequestByRequest request)
        {
            var result = await _mediator.Send(new CancelRequestCommand(request));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}