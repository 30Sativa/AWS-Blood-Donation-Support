using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;
using System.Collections.Generic;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record SearchUsersQuery(
        string? Keyword,
        string? RoleCode,
        bool? IsActive,
        int PageNumber = 1,
        int PageSize = 10) : IRequest<PaginatedResponse<UserResponse>>;

    public class SearchUsersQueryHandler
        : IRequestHandler<SearchUsersQuery, PaginatedResponse<UserResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _profileRepository;

        public SearchUsersQueryHandler(
            IUserRepository userRepository,
            IUserProfileRepository profileRepository)
        {
            _userRepository = userRepository;
            _profileRepository = profileRepository;
        }

        public async Task<PaginatedResponse<UserResponse>> Handle(
            SearchUsersQuery request,
            CancellationToken cancellationToken)
        {
            var (users, totalCount) = await _userRepository.SearchAsync(
                request.Keyword,
                request.RoleCode,
                request.IsActive,
                request.PageNumber,
                request.PageSize);

            var result = new List<UserResponse>();

            foreach (var user in users)
            {
                var profile = await _profileRepository.GetByIdAsync(user.Id);
                result.Add(new UserResponse
                {
                    Id = user.Id,
                    Email = user.Email.ToString(),
                    PhoneNumber = user.PhoneNumber,
                    FullName = profile?.FullName ?? string.Empty,
                    BirthYear = profile?.BirthYear,
                    Gender = profile?.Gender,
                    Role = string.Join(", ", user.Roles),
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

