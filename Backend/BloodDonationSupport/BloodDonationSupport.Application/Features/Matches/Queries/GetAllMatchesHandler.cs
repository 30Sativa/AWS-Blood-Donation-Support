using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Queries
{
    public class GetAllMatchesHandler
        : IRequestHandler<GetAllMatchesQuery, BaseResponse<IEnumerable<MatchData>>>
    {
        private readonly IMatchRepository _matchRepo;

        public GetAllMatchesHandler(IMatchRepository matchRepo)
        {
            _matchRepo = matchRepo;
        }

        public async Task<BaseResponse<IEnumerable<MatchData>>> Handle(
            GetAllMatchesQuery request,
            CancellationToken cancellationToken)
        {
            var matches = await _matchRepo.GetAllDtosAsync();

            return BaseResponse<IEnumerable<MatchData>>
                .SuccessResponse(matches, "Matches retrieved successfully.");
        }
    }

    public class GetMyMatchesQueryHandler
        : IRequestHandler<GetMyMatchesQuery, BaseResponse<IEnumerable<MatchData>>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IUserRepository _userRepo;
        private readonly IMatchRepository _matchRepo;

        public GetMyMatchesQueryHandler(
            ICurrentUserService currentUser,
            IUserRepository userRepo,
            IMatchRepository matchRepo)
        {
            _currentUser = currentUser;
            _userRepo = userRepo;
            _matchRepo = matchRepo;
        }

        public async Task<BaseResponse<IEnumerable<MatchData>>> Handle(
            GetMyMatchesQuery request,
            CancellationToken cancellationToken)
        {
            // 1) User must login
            if (!_currentUser.IsAuthenticated || string.IsNullOrEmpty(_currentUser.CognitoUserId))
                return BaseResponse<IEnumerable<MatchData>>
                    .FailureResponse("User not authenticated.");

            // 2) Get user by CognitoId
            var user = await _userRepo.GetByCognitoUserIdAsync(_currentUser.CognitoUserId);
            if (user == null)
                return BaseResponse<IEnumerable<MatchData>>
                    .FailureResponse("User not found in database.");

            // 3) Get matches for this user
            // - Matches where user is the requester (through requests)
            // - Matches where user is the donor (through donor profile)
            var matches = await _matchRepo.GetDtosByUserIdAsync(user.Id);

            return BaseResponse<IEnumerable<MatchData>>
                .SuccessResponse(matches, $"Found {matches.Count()} matches.");
        }
    }
}
