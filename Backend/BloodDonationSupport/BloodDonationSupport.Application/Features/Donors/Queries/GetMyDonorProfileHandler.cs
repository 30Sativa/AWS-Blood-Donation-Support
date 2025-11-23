using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetMyDonorProfileHandler
        : IRequestHandler<GetMyDonorProfileQuery, BaseResponse<DonorProfileResponse>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IDonorRepository _donorRepo;

        public GetMyDonorProfileHandler(
            ICurrentUserService currentUser,
            IDonorRepository donorRepo)
        {
            _currentUser = currentUser;
            _donorRepo = donorRepo;
        }

        public async Task<BaseResponse<DonorProfileResponse>> Handle(
            GetMyDonorProfileQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated || _currentUser.UserId == null)
            {
                return BaseResponse<DonorProfileResponse>
                    .FailureResponse("User is not authenticated.");
            }

            long userId = _currentUser.UserId.Value;

            // lấy donor theo userId
            var donor = await _donorRepo.GetByUserIdWithRelationsAsync(userId);

            if (donor == null)
            {
                return BaseResponse<DonorProfileResponse>
                    .FailureResponse("Donor profile not found. Please register donor first.");
            }

            // build response
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
                AddressDisplay = donor.AddressDisplay,

                Latitude = donor.LastKnownLocation?.Latitude,
                Longitude = donor.LastKnownLocation?.Longitude,

                TravelRadiusKm = donor.TravelRadiusKm,
                NextEligibleDate = donor.NextEligibleDate,
                IsReady = donor.IsReady,

                CreatedAt = donor.CreatedAt,
                UpdatedAt = donor.UpdatedAt
            };

            // add availabilities
            response.Availabilities = donor.Availabilities
                .Select(a => new DonorAvailabilityResponse
                {
                    Weekday = a.Weekday,
                    TimeFromMin = a.TimeFromMin,
                    TimeToMin = a.TimeToMin
                }).ToList();

            // add health conditions
            response.HealthConditions = donor.HealthConditions
                .Select(h => new DonorHealthConditionItemResponse
                {
                    ConditionId = h.ConditionId,
                    ConditionName = h.ConditionName
                }).ToList();

            return BaseResponse<DonorProfileResponse>.SuccessResponse(response);
        }
    }
}
