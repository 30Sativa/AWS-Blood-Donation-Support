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

        // [PUT] api/addresses/{id} (Update address)
        [HttpPut("{id:long}")]
        [Authorize]
        public async Task<IActionResult> UpdateAddress(long id, [FromBody] UpdateAddressRequest request)
        {
            var result = await _mediator.Send(new UpdateAddressCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}

