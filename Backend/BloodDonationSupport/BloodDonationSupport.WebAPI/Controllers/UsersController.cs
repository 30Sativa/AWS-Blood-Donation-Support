using BloodDonationSupport.Application.Features.Users.Commands;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IMediator mediator, ILogger<UsersController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            // ✅ tạo command thủ công
            var command = new RegisterUserCommand(request);

            // ✅ gửi qua MediatR
            var result = await _mediator.Send(command);

            // ✅ phản hồi kết quả
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }



        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var command = new LoginUserCommand(request);
            var result = await _mediator.Send(command);

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }
    }
}
