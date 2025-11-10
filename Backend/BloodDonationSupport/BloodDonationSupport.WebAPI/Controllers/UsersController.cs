using BloodDonationSupport.Application.Features.Users.Commands;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Application.Features.Users.Queries;
using MediatR;
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

        //  [POST] api/users/register (Cognito Register)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            var result = await _mediator.Send(new RegisterUserCommand(request));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        //  [POST] api/users/login (Cognito Login)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            var result = await _mediator.Send(new LoginUserCommand(request));

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        //  [POST] api/users (Admin Create new user)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var result = await _mediator.Send(new CreateUserCommand(request));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // [PUT] api/users/{id} (Admin Update user)
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserRequest request)
        {
            request.Id = id;
            var result = await _mediator.Send(new UpdateUserCommand(request));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // [GET] api/users (Admin Get all users)
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllUsersQuery(pageNumber, pageSize));
            return Ok(result);
        }

        // [GET] api/users/{id} (Admin Get user by Id)
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetUserById(long id)
        {
            var result = await _mediator.Send(new GetUserByIdQuery(id));

            if (result == null)
                return NotFound($"User with ID {id} not found.");

            return Ok(result);
        }

        // [DELETE] api/users/{id} (Admin Delete user)
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var result = await _mediator.Send(new DeleteUserCommand(id));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // [GET] api/users/{id}/profile (Get user with profile by Id)
        [HttpGet("{id:long}/profile")]
        public async Task<IActionResult> GetUserWithProfileById(long id)
        {
            var result = await _mediator.Send(new GetUserWithProfileByIdQuery(id));
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }
        // [GET] api/users/profile (Get all users with profile)
        [HttpGet("profile")]
        public async Task<IActionResult> GetAllUserWithProfile([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllUsersWithProfilesQuery(pageNumber, pageSize));
            return Ok(result);
        }
        //  [POST] api/users/refresh-token (Cognito Refresh Token)
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var result = await _mediator.Send(new RefreshTokenCommand(refreshToken));

            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }
        
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand request)
        {
            var result = await _mediator.Send(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ConfirmResetPasswordCommand request)
        {
            var result = await _mediator.Send(request);
            return result.Success ? Ok(result) : BadRequest(result);
        }


        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            var result = await _mediator.Send(new ConfirmEmailCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

    }
}