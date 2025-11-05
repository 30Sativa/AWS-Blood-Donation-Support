using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetAllUsersQueryHandler(IUserRepository userRepository, IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<IEnumerable<UserResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var users = await _userRepository.GetAllAsync();
            var result = new List<UserResponse>();
            foreach (var user in users)
            {
                var profile = await _userProfileRepository.GetByIdAsync(user.Id);
                var roles = await _userRepository.GetRolesByUserIdAsync(user.Id);
                result.Add(new UserResponse
                {
                    Id = user.Id,
                    Email = user.Email.ToString(),
                    PhoneNumber = user.PhoneNumber,
                    FullName = profile?.FullName ?? string.Empty,
                    BirthYear = profile?.BirthYear,
                    Gender = profile?.Gender,
                    Role = string.Join(", ", roles),
                    CognitoUserId = user.CognitoUserId,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                });
            }
            return result;
        }
    }
}