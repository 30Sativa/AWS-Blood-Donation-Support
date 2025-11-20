using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class RegisterDonorCommandHandler
        : IRequestHandler<RegisterDonorCommand, BaseResponse<RegisterDonorResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ILocationService _locationService;

        public RegisterDonorCommandHandler(
            IUnitOfWork unitOfWork,
            IDonorRepository donorRepository,
            IUserRepository userRepository,
            IAddressRepository addressRepository,
            ILocationService locationService)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _locationService = locationService;
        }

        public async Task<BaseResponse<RegisterDonorResponse>> Handle(
            RegisterDonorCommand request,
            CancellationToken cancellationToken)
        {
            var reg = request.request;

            // ============================================================
            // 1) VALIDATE USER EXISTS
            // ============================================================
            var user = await _userRepository.GetByIdAsync(reg.UserId);
            if (user == null)
                return BaseResponse<RegisterDonorResponse>.FailureResponse(
                    $"User with ID {reg.UserId} does not exist."
                );

            // ============================================================
            // 2) CHECK DONOR EXISTS
            // ============================================================
            var donorExists = await _donorRepository.ExistsAsync(d => d.UserId == reg.UserId);
            if (donorExists)
                return BaseResponse<RegisterDonorResponse>.FailureResponse(
                    $"Donor profile for User ID {reg.UserId} already exists."
                );

            // ============================================================
            // 3) PARSE ADDRESS VIA AWS LOCATION
            // ============================================================
            var parsed = await _locationService.ParseAddressAsync(reg.FullAddress);

            if (parsed == null)
                return BaseResponse<RegisterDonorResponse>.FailureResponse(
                    "Unable to parse address. Please check the address again."
                );

            // ============================================================
            // 4) CREATE ADDRESS DOMAIN + SAVE FIRST (get real ID)
            // ============================================================
            var addressDomain = AddressDomain.Create(
                line1: parsed.Line1,
                district: parsed.District,
                city: parsed.City,
                province: parsed.Province,
                country: parsed.Country,
                postalCode: parsed.PostalCode,
                normalizedAddress: parsed.NormalizedAddress,
                placeId: parsed.PlaceId,
                confidenceScore: parsed.ConfidenceScore.HasValue
                    ? (decimal?)parsed.ConfidenceScore.Value
                    : null,
                latitude: parsed.Latitude,
                longitude: parsed.Longitude
            );

            // Save immediately and get ID
            long addressId = await _addressRepository.AddAndReturnIdAsync(addressDomain);

            // ============================================================
            // 5) CREATE DONOR DOMAIN
            // ============================================================
            var donor = DonorDomain.Create(reg.UserId, reg.TravelRadiusKm);

            donor.SetBloodType(reg.BloodTypeId);
            donor.SetAddress(addressId);

            donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));

            if (reg.IsReady)
                donor.MarkReady(true);

            if (reg.NextEligibleDate.HasValue)
                donor.UpdateEligibility(reg.NextEligibleDate.Value);

            // ============================================================
            // 6) ADD AVAILABILITIES
            // ============================================================
            if (reg.Availabilities != null)
            {
                foreach (var a in reg.Availabilities)
                {
                    donor.AddAvailability(
                        DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin)
                    );
                }
            }

            // ============================================================
            // 7) ADD HEALTH CONDITIONS
            // ============================================================
            if (reg.HealthConditionIds != null)
            {
                foreach (var cond in reg.HealthConditionIds)
                {
                    donor.AddHealthCondition(DonorHealthConditionDomain.Create(0, cond));
                }
            }

            // ============================================================
            // 8) SAVE DONOR (transaction controlled by UoW)
            // ============================================================
            await _donorRepository.AddAsync(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ============================================================
            // 9) BUILD RESPONSE
            // ============================================================
            var response = new RegisterDonorResponse
            {
                DonorId = donor.Id,
                UserId = donor.UserId,
                BloodTypeId = donor.BloodTypeId,
                AddressId = donor.AddressId,
                TravelRadiusKm = donor.TravelRadiusKm,
                IsReady = donor.IsReady,
                NextEligibleDate = donor.NextEligibleDate,
                CreatedAt = donor.CreatedAt,
                Latitude = donor.LastKnownLocation?.Latitude,
                Longitude = donor.LastKnownLocation?.Longitude,
                Availabilities = donor.Availabilities.Select(a => new DonorAvailabilityResponse
                {
                    Weekday = a.Weekday,
                    TimeFromMin = a.TimeFromMin,
                    TimeToMin = a.TimeToMin
                }).ToList(),
                HealthConditions = donor.HealthConditions.Select(h => new DonorHealthConditionItemResponse
                {
                    ConditionId = h.ConditionId
                }).ToList()
            };

            return BaseResponse<RegisterDonorResponse>.SuccessResponse(
                response,
                "Donor registered successfully."
            );
        }
    }
}
