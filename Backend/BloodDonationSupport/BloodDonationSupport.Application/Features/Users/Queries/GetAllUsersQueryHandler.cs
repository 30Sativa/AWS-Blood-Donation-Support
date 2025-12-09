using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PaginatedResponse<UserResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetAllUsersQueryHandler(IUserRepository userRepository, IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<PaginatedResponse<UserResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var (users, totalCount) = await _userRepository.GetPagedAsync(request.PageNumber, request.PageSize);
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

            return new PaginatedResponse<UserResponse>
            {
                Items = result,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }
    }
}