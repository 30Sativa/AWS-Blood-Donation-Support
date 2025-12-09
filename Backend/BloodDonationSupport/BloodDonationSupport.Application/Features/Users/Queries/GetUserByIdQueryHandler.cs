using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetUserByIdQueryHandler(IUserRepository userRepository, IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<UserResponse> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                throw new Exception($"User with id {request.UserId} not found.");
            }
            var profile = await _userProfileRepository.GetByIdAsync(request.UserId);
            var role = await _userRepository.GetRolesByUserIdAsync(request.UserId);
            return new UserResponse
            {
                Id = user.Id,
                Email = user.Email.ToString(),
                PhoneNumber = user.PhoneNumber,
                FullName = profile?.FullName ?? string.Empty,
                BirthYear = profile?.BirthYear,
                Gender = profile?.Gender,
                Role = string.Join(", ", role),
                CognitoUserId = user.CognitoUserId,
                CreatedAt = user.CreatedAt
            };
        }
    }
}