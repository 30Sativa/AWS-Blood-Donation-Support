using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetCurrentUserProfileQuery : IRequest<BaseResponse<UserWithProfileResponse>>;

    public class GetCurrentUserProfileQueryHandler
        : IRequestHandler<GetCurrentUserProfileQuery, BaseResponse<UserWithProfileResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetCurrentUserProfileQueryHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<BaseResponse<UserWithProfileResponse>> Handle(
            GetCurrentUserProfileQuery request,
            CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<UserWithProfileResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<UserWithProfileResponse>.FailureResponse("User not found.");
            }

            var profile = await _userProfileRepository.GetByUserIdAsync(user.Id);
            
            // Get roles from database
            var roles = await _userRepository.GetRolesByUserIdAsync(user.Id);

            var dto = new UserWithProfileResponse
            {
                UserId = user.Id,
                Email = user.Email.Value,
                PhoneNumber = user.PhoneNumber,
                CognitoUserId = user.CognitoUserId,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Roles = roles.ToList(),
                FullName = profile?.FullName,
                BirthYear = profile?.BirthYear,
                Gender = profile?.Gender,
                PrivacyPhoneVisibleToStaffOnly = profile?.PrivacyPhoneVisibleToStaffOnly
            };

            return BaseResponse<UserWithProfileResponse>.SuccessResponse(dto);
        }
    }
}

