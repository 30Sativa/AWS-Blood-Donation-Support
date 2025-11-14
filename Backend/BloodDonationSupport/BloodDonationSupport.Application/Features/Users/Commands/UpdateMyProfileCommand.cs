using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using BloodDonationSupport.Domain.Users.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record UpdateMyProfileCommand(UpdateMyProfileRequest Request)
        : IRequest<BaseResponse<UserWithProfileResponse>>;

    public class UpdateMyProfileCommandHandler
        : IRequestHandler<UpdateMyProfileCommand, BaseResponse<UserWithProfileResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateMyProfileCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository,
            IUnitOfWork unitOfWork)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<UserWithProfileResponse>> Handle(
            UpdateMyProfileCommand command,
            CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || !_currentUserService.UserId.HasValue)
            {
                return BaseResponse<UserWithProfileResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId.Value);
            if (user == null)
            {
                return BaseResponse<UserWithProfileResponse>.FailureResponse("User not found.");
            }

            // Update phone number if provided
            if (!string.IsNullOrWhiteSpace(command.Request.PhoneNumber))
            {
                user.UpdatePhone(command.Request.PhoneNumber);
            }

            // Update or create profile
            var profile = await _userProfileRepository.GetByUserIdAsync(user.Id);
            if (profile == null)
            {
                profile = UserProfileDomain.Create(
                    user.Id,
                    command.Request.FullName,
                    command.Request.BirthYear,
                    command.Request.Gender,
                    command.Request.PrivacyPhoneVisibleToStaffOnly ?? true);

                await _userProfileRepository.AddAsync(profile);
            }
            else
            {
                profile.UpdateProfile(
                    command.Request.FullName,
                    command.Request.BirthYear,
                    command.Request.Gender,
                    command.Request.PrivacyPhoneVisibleToStaffOnly);
                _userProfileRepository.Update(profile);
            }

            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new UserWithProfileResponse
            {
                UserId = user.Id,
                Email = user.Email.Value,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                FullName = profile.FullName,
                BirthYear = profile.BirthYear,
                Gender = profile.Gender,
                PrivacyPhoneVisibleToStaffOnly = profile.PrivacyPhoneVisibleToStaffOnly
            };

            return BaseResponse<UserWithProfileResponse>.SuccessResponse(response, "Profile updated successfully.");
        }
    }
}

