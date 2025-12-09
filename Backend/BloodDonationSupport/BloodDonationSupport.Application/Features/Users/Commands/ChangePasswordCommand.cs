using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record ChangePasswordCommand(ChangePasswordRequest Request) : IRequest<BaseResponse<string>>;

    public class ChangePasswordCommandHandler
        : IRequestHandler<ChangePasswordCommand, BaseResponse<string>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly ICognitoService _cognitoService;

        public ChangePasswordCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            ICognitoService cognitoService)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<string>> Handle(
            ChangePasswordCommand command,
            CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return BaseResponse<string>.FailureResponse("User is not authenticated.");
            }

            var email = _currentUserService.Email;
            if (string.IsNullOrWhiteSpace(email))
            {
                return BaseResponse<string>.FailureResponse("Authenticated user has no email.");
            }

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse("User not found.");
            }

            try
            {
                // Re-authenticate to make sure current password is correct
                await _cognitoService.LoginAsync(email, command.Request.CurrentPassword);
            }
            catch (Exception)
            {
                return BaseResponse<string>.FailureResponse("Current password is incorrect.");
            }

            try
            {
                await _cognitoService.SetUserPasswordAsync(user.CognitoUserId, command.Request.NewPassword);
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse($"Failed to update password: {ex.Message}");
            }

            return BaseResponse<string>.SuccessResponse("Password updated successfully.");
        }
    }
}