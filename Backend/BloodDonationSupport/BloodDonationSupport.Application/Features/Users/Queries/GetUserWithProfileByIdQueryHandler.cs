using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public class GetUserWithProfileByIdQueryHandler : IRequestHandler<GetUserWithProfileByIdQuery, BaseResponse<UserWithProfileResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetUserWithProfileByIdQueryHandler(IUserRepository userRepository, IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<BaseResponse<UserWithProfileResponse>> Handle(GetUserWithProfileByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return BaseResponse<UserWithProfileResponse>.FailureResponse($"User with id {request.UserId} not found.");
            }
            var profile = await _userProfileRepository.GetByIdAsync(request.UserId);
            var dto = new UserWithProfileResponse
            {
                UserId = user.Id,
                Email = user.Email.Value,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                FullName = profile?.FullName,
                BirthYear = profile?.BirthYear,
                Gender = profile?.Gender,
                PrivacyPhoneVisibleToStaffOnly = profile?.PrivacyPhoneVisibleToStaffOnly
            };

            return BaseResponse<UserWithProfileResponse>.SuccessResponse(dto);
        }
    }
}