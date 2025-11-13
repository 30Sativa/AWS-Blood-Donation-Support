using BloodDonationSupport.Application.Features.Requests.Commands;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using MediatR;
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
        public async Task<IActionResult> GetAllRequests([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            // (Tạm thời chưa có query handler, bạn sẽ thêm sau)
            _logger.LogInformation("📦 Fetching requests page {PageNumber}", pageNumber);
            return Ok("GetAllRequests endpoint placeholder — TODO: implement query handler.");
        }

        // =====================================================
        // [GET] api/requests/{id} (get single request by ID)
        // =====================================================
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetRequestById(long id)
        {
            // (Tạm thời placeholder)
            _logger.LogInformation("🔍 Fetching request by ID {RequestId}", id);
            return Ok($"GetRequestById placeholder for RequestId={id} — TODO: implement query handler.");
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

            _logger.LogInformation("✅ Request registered successfully for user {UserId}", request.RequesterUserId);
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

            var result = await _mediator.Send(new UpdateRequestStatusCommand(request));

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
        public async Task<IActionResult> GetNearbyRequests([FromQuery] double lat, [FromQuery] double lng, [FromQuery] double radiusKm = 10)
        {
            // (Tạm thời placeholder – sau sẽ implement query dùng AWS Location)
            _logger.LogInformation("📍 Finding nearby requests at ({Lat}, {Lng}) radius {Radius}km", lat, lng, radiusKm);
            return Ok("GetNearbyRequests placeholder — TODO: implement with LocationService.");
        }
    }
}