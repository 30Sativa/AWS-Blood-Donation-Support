using BloodDonationSupport.Application.Features.Addresses.Commands;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Addresses.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AddressesController> _logger;

        public AddressesController(IMediator mediator, ILogger<AddressesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // [GET] api/addresses (Get all addresses with pagination)
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAddresses([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllAddressesQuery(pageNumber, pageSize));
            return Ok(result);
        }

        // [GET] api/addresses/me (Get current user's address)
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserAddress()
        {
            var result = await _mediator.Send(new GetCurrentUserAddressQuery());
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [POST] api/addresses (Create new address)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressRequest request)
        {
            var result = await _mediator.Send(new CreateAddressCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [GET] api/addresses/{id} (Get address by ID)
        [HttpGet("{id:long}")]
        [Authorize]
        public async Task<IActionResult> GetAddressById(long id)
        {
            var result = await _mediator.Send(new GetAddressByIdQuery(id));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [PUT] api/addresses/me (Update current user's address)
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMyAddress([FromBody] UpdateAddressRequest request)
        {
            var result = await _mediator.Send(new UpdateMyAddressCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/addresses/{id} (Update address by ID)
        [HttpPut("{id:long}")]
        [Authorize]
        public async Task<IActionResult> UpdateAddress(long id, [FromBody] UpdateAddressRequest request)
        {
            var result = await _mediator.Send(new UpdateAddressCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}

