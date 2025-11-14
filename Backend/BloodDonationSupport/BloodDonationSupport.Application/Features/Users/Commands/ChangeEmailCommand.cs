using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Domain.Users.ValueObjects;
using MediatR;
using System;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record ChangeEmailCommand(ChangeEmailRequest Request) : IRequest<BaseResponse<string>>;

    public class ChangeEmailCommandHandler
        : IRequestHandler<ChangeEmailCommand, BaseResponse<string>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly ICognitoService _cognitoService;
        private readonly IUnitOfWork _unitOfWork;

        public ChangeEmailCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            ICognitoService cognitoService,
            IUnitOfWork unitOfWork)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _cognitoService = cognitoService;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            ChangeEmailCommand command,
            CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return BaseResponse<string>.FailureResponse("User is not authenticated.");
            }

            var currentEmail = _currentUserService.Email;
            if (string.IsNullOrWhiteSpace(currentEmail))
            {
                return BaseResponse<string>.FailureResponse("Authenticated user has no email.");
            }

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse("User not found.");
            }

            var newEmailRaw = command.Request.NewEmail?.Trim();
            if (string.IsNullOrWhiteSpace(newEmailRaw))
            {
                return BaseResponse<string>.FailureResponse("New email is required.");
            }

            if (string.Equals(newEmailRaw, user.Email.Value, StringComparison.OrdinalIgnoreCase))
            {
                return BaseResponse<string>.FailureResponse("New email must be different from current email.");
            }

            if (await _userRepository.IsExistEmailAsync(newEmailRaw))
            {
                return BaseResponse<string>.FailureResponse("Email is already in use.");
            }

            try
            {
                await _cognitoService.LoginAsync(currentEmail, command.Request.CurrentPassword);
            }
            catch (Exception)
            {
                return BaseResponse<string>.FailureResponse("Current password is incorrect.");
            }

            try
            {
                await _cognitoService.UpdateUserAsync(user.CognitoUserId, newEmailRaw, null);
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse($"Failed to update Cognito email: {ex.Message}");
            }

            user.UpdateEmail(new Email(newEmailRaw));
            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Email updated successfully. Please verify the new address via Cognito email.");
        }
    }
}

