using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetCurrentDonorQuery : IRequest<BaseResponse<DonorDetail>>;

    public class GetCurrentDonorQueryHandler : IRequestHandler<GetCurrentDonorQuery, BaseResponse<DonorDetail>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IDonorRepository _donorRepository;

        public GetCurrentDonorQueryHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IDonorRepository donorRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<DonorDetail>> Handle(GetCurrentDonorQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<DonorDetail>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<DonorDetail>.FailureResponse("User not found.");
            }

            var donor = await _donorRepository.GetByUserIdAsync(user.Id);
            if (donor == null)
            {
                return BaseResponse<DonorDetail>.FailureResponse("Donor not found for this user.");
            }

            var response = new DonorDetail
            {
                DonorId = donor.Id,
                FullName = donor.User?.Profile?.FullName,
                BloodGroup = donor.BloodType != null ? donor.BloodType.Abo + donor.BloodType.Rh : null,
                IsReady = donor.IsReady,
                NextEligibleDate = donor.NextEligibleDate,
                CreatedAt = donor.CreatedAt,
                Address = donor.AddressDisplay,
                Availabilities = donor.Availabilities.Select(a => 
                    $"{ToVietnameseDay(a.Weekday)}: {MinutesToString(a.TimeFromMin)} - {MinutesToString(a.TimeToMin)}").ToList(),
                HealthConditions = donor.HealthConditions.Select(h => h.ConditionName ?? "Unknown").ToList(),
                LastKnownLocation = donor.LastKnownLocation != null 
                    ? $"{donor.LastKnownLocation.Latitude}, {donor.LastKnownLocation.Longitude}" 
                    : null,
                UpdatedAt = donor.UpdatedAt
            };

            return BaseResponse<DonorDetail>.SuccessResponse(response);
        }

        private static string ToVietnameseDay(byte weekday)
        {
            return weekday switch
            {
                0 => "Chủ nhật",
                1 => "Thứ 2",
                2 => "Thứ 3",
                3 => "Thứ 4",
                4 => "Thứ 5",
                5 => "Thứ 6",
                6 => "Thứ 7",
                _ => $"Thứ {weekday}"
            };
        }

        private static string MinutesToString(short minutes)
        {
            var h = minutes / 60;
            var m = minutes % 60;
            return $"{h:00}:{m:00}";
        }
    }
}

