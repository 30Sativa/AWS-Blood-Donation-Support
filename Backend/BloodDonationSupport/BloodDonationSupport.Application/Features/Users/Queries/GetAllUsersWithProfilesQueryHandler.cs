using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public class GetAllUsersWithProfilesQueryHandler: IRequestHandler<GetAllUsersWithProfilesQuery, BaseResponse<IEnumerable<GetAllUserWithProfileResponse>>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public GetAllUsersWithProfilesQueryHandler(
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        public async Task<BaseResponse<IEnumerable<GetAllUserWithProfileResponse>>> Handle(
            GetAllUsersWithProfilesQuery request,
            CancellationToken cancellationToken)
        {
            var users = await _userRepository.GetAllAsync();
            var profiles = await _userProfileRepository.GetAllAsync();

            var result = from u in users
                         join p in profiles on u.Id equals p.UserId into userProfiles
                         from up in userProfiles.DefaultIfEmpty()
                         select new GetAllUserWithProfileResponse
                         {
                             Id = u.Id,
                             Email = u.Email.Value,
                             PhoneNumber = u.PhoneNumber,
                             FullName = up?.FullName ?? string.Empty,
                             BirthYear = up?.BirthYear,
                             Gender = up?.Gender,
                             Roles = string.Join(", ", u.Roles),
                             IsActive = u.IsActive,
                             CreatedAt = u.CreatedAt
                         };

            return BaseResponse<IEnumerable<GetAllUserWithProfileResponse>>.SuccessResponse(
                result.ToList(),
                "Fetched successfully"
            );
        }
    }
}
