using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetDonorProfileHandler
    : IRequestHandler<GetDonorProfileQuery, BaseResponse<DonorProfileResponse>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IAddressRepository _addressRepo;

        public GetDonorProfileHandler(
            IDonorRepository donorRepo,
            IAddressRepository addressRepo)
        {
            _donorRepo = donorRepo;
            _addressRepo = addressRepo;
        }

        public async Task<BaseResponse<DonorProfileResponse>> Handle(
    GetDonorProfileQuery query,
    CancellationToken cancellationToken)
        {
            // Load donor + user + bloodtype + availabilities + health conditions
            var donor = await _donorRepo.GetByIdWithRelationsAsync(query.DonorId);
            if (donor == null)
                return BaseResponse<DonorProfileResponse>.FailureResponse("Donor not found.");

            // Load address (optional)
            string? addressDisplay = null;
            if (donor.AddressId.HasValue)
            {
                var address = await _addressRepo.GetByIdAsync(donor.AddressId.Value);
                addressDisplay = address?.NormalizedAddress
                                 ?? $"{address?.Line1}, {address?.District}, {address?.City}";
            }

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
                AddressDisplay = addressDisplay,

                Latitude = donor.LastKnownLocation?.Latitude,
                Longitude = donor.LastKnownLocation?.Longitude,

                TravelRadiusKm = donor.TravelRadiusKm,
                NextEligibleDate = donor.NextEligibleDate,
                IsReady = donor.IsReady,

                CreatedAt = donor.CreatedAt,
                UpdatedAt = donor.UpdatedAt
            };

            // Availability mapping
            response.Availabilities = donor.Availabilities
                .Select(a => new DonorAvailabilityResponse
                {
                    Weekday = a.Weekday,
                    TimeFromMin = a.TimeFromMin,
                    TimeToMin = a.TimeToMin
                })
                .ToList();

            // Health conditions mapping
            response.HealthConditions = donor.HealthConditions
                .Select(h => new DonorHealthConditionItemResponse
                {
                    ConditionId = h.ConditionId,
                    ConditionName = h.ConditionName
                })
                .ToList();

            return BaseResponse<DonorProfileResponse>.SuccessResponse(response);
        }
    }
}