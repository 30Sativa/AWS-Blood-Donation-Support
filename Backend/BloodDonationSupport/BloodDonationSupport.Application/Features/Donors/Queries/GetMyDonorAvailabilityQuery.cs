using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System.Linq;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetMyDonorAvailabilityQuery : IRequest<BaseResponse<DonorAvailabilityResponse>>;

    public class GetMyDonorAvailabilityQueryHandler : IRequestHandler<GetMyDonorAvailabilityQuery, BaseResponse<DonorAvailabilityResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IDonorRepository _donorRepository;

        public GetMyDonorAvailabilityQueryHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IDonorRepository donorRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<DonorAvailabilityResponse>> Handle(GetMyDonorAvailabilityQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<DonorAvailabilityResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<DonorAvailabilityResponse>.FailureResponse("User not found.");
            }

            var donor = await _donorRepository.GetByUserIdWithRelationsAsync(user.Id);
            if (donor == null)
            {
                return BaseResponse<DonorAvailabilityResponse>.FailureResponse("Donor profile not found.");
            }

            var response = new DonorAvailabilityResponse
            {
                DonorId = donor.Id,
                Availabilities = donor.Availabilities.Select(a => new DonorAvailabilityResponse.AvailabilityItem
                {
                    Weekday = a.Weekday,
                    TimeFromMin = a.TimeFromMin,
                    TimeToMin = a.TimeToMin
                }).ToList()
            };

            return BaseResponse<DonorAvailabilityResponse>.SuccessResponse(response);
        }
    }
}

