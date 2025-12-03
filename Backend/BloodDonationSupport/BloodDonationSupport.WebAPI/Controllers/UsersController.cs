using BloodDonationSupport.Application.Features.Users.Commands;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Application.Features.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var result = await _mediator.Send(new CreateUserCommand(request));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // [PUT] api/users/{id} (Admin Update user)
        [HttpPut("{id:long}")]
        [Authorize(Policy = "AdminOnly")]
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
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllUsersQuery(pageNumber, pageSize));
            return Ok(result);
        }

        // [GET] api/users/search (Search users with filters)
        [HttpGet("search")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> SearchUsers([FromQuery] SearchUsersRequest request)
        {
            var query = new SearchUsersQuery(
                request.Keyword,
                request.RoleCode,
                request.IsActive,
                request.PageNumber,
                request.PageSize);

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // [GET] api/users/me (Get current user profile)
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var result = await _mediator.Send(new GetCurrentUserProfileQuery());
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        // [PUT] api/users/me/profile (Update own profile)
        [HttpPut("me/profile")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
        {
            var result = await _mediator.Send(new UpdateMyProfileCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [POST] api/users/change-password
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _mediator.Send(new ChangePasswordCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [POST] api/users/change-email
        [HttpPost("change-email")]
        [Authorize]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
        {
            var result = await _mediator.Send(new ChangeEmailCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [GET] api/users/{id} (Admin Get user by Id)
        [HttpGet("{id:long}")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> GetUserById(long id)
        {
            var result = await _mediator.Send(new GetUserByIdQuery(id));

            if (result == null)
                return NotFound($"User with ID {id} not found.");

            return Ok(result);
        }

        // [DELETE] api/users/{id} (Admin Delete user)
        [HttpDelete("{id:long}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var result = await _mediator.Send(new DeleteUserCommand(id));

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // [GET] api/users/{id}/profile (Get user with profile by Id)
        [HttpGet("{id:long}/profile")]
        [Authorize(Policy = "AdminOrStaff")]
        public async Task<IActionResult> GetUserWithProfileById(long id)
        {
            var result = await _mediator.Send(new GetUserWithProfileByIdQuery(id));
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        // [GET] api/users/profile (Get all users with profile)
        [HttpGet("profile")]
        [Authorize(Policy = "AdminOrStaff")]
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

        // [PUT] api/users/{id}/roles
        [HttpPut("{id:long}/roles")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateUserRoles(long id, [FromBody] UpdateUserRolesRequest request)
        {
            var result = await _mediator.Send(new UpdateUserRolesCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/users/{id}/status
        [HttpPut("{id:long}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateUserStatusRequest request)
        {
            var result = await _mediator.Send(new UpdateUserStatusCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

       
    }
}