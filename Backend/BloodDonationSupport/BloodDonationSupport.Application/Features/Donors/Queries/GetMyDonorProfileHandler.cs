using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Donors.Queries;
using MediatR;

public class GetMyDonorProfileHandler
    : IRequestHandler<GetMyDonorProfileQuery, BaseResponse<DonorProfileResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IDonorRepository _donorRepo;
    private readonly IUserRepository _userRepo;

    public GetMyDonorProfileHandler(
        ICurrentUserService currentUser,
        IDonorRepository donorRepo,
        IUserRepository userRepo)
    {
        _currentUser = currentUser;
        _donorRepo = donorRepo;
        _userRepo = userRepo;
    }

    public async Task<BaseResponse<DonorProfileResponse>> Handle(
        GetMyDonorProfileQuery request, CancellationToken cancellationToken)
    {
        // 1) Check authenticated
        if (!_currentUser.IsAuthenticated || string.IsNullOrEmpty(_currentUser.CognitoUserId))
        {
            return BaseResponse<DonorProfileResponse>
                .FailureResponse("User is not authenticated.");
        }

        // 2) Get user by Cognito ID
        var user = await _userRepo.GetByCognitoUserIdAsync(_currentUser.CognitoUserId);
        if (user == null)
        {
            return BaseResponse<DonorProfileResponse>
                .FailureResponse("User not found in database.");
        }

        // 3) Find donor profile
        var donor = await _donorRepo.GetByUserIdWithRelationsAsync(user.Id);

        if (donor == null)
        {
            return BaseResponse<DonorProfileResponse>
                .FailureResponse("Donor profile not found. Please register donor first.");
        }

        // 4) Build response
        var response = new DonorProfileResponse
        {
            DonorId = donor.Id,
            UserId = donor.UserId,
            FullName = donor.User?.Profile?.FullName ?? "",
            PhoneNumber = donor.User?.PhoneNumber,
            Email = donor.User?.Email?.Value,

            BloodTypeId = donor.BloodTypeId,
            BloodGroup = donor.BloodType != null
                ? $"{donor.BloodType.Abo} {donor.BloodType.Rh}"
                : null,

            AddressId = donor.AddressId,
            AddressDisplay = donor.AddressDisplay ?? "(Address unavailable)",  // 🔥 FALLBACK THÊM AN TOÀN

            Latitude = donor.LastKnownLocation?.Latitude,
            Longitude = donor.LastKnownLocation?.Longitude,

            TravelRadiusKm = donor.TravelRadiusKm,
            NextEligibleDate = donor.NextEligibleDate,
            IsReady = donor.IsReady,

            CreatedAt = donor.CreatedAt,
            UpdatedAt = donor.UpdatedAt
        };

        response.Availabilities = donor.Availabilities
            .Select(a => new DonorAvailabilityResponse
            {
                Weekday = a.Weekday,
                TimeFromMin = a.TimeFromMin,
                TimeToMin = a.TimeToMin
            }).ToList();

        response.HealthConditions = donor.HealthConditions
            .Select(h => new DonorHealthConditionItemResponse
            {
                ConditionId = h.ConditionId,
                ConditionName = h.ConditionName
            }).ToList();

        return BaseResponse<DonorProfileResponse>.SuccessResponse(response);
    }
}