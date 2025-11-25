using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;
using System.Linq;

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

        // 1) Check user exists
        var user = await _userRepository.GetByIdAsync(reg.UserId);
        if (user == null)
            return BaseResponse<RegisterDonorResponse>.FailureResponse("User not found.");

        // 2) Prevent duplicate donor
        if (await _donorRepository.ExistsAsync(d => d.UserId == reg.UserId))
            return BaseResponse<RegisterDonorResponse>.FailureResponse("Donor profile already exists.");

        // 3) Parse full address
        var parsed = await _locationService.ParseAddressAsync(reg.FullAddress);
        if (parsed == null)
            return BaseResponse<RegisterDonorResponse>.FailureResponse("Invalid address.");

        // 4) Save Address first
        var address = AddressDomain.Create(
            parsed.Line1,
            parsed.District,
            parsed.City,
            parsed.Province,
            parsed.Country,
            parsed.PostalCode,
            parsed.NormalizedAddress,
            parsed.PlaceId,
            (decimal?)parsed.ConfidenceScore,
            parsed.Latitude,
            parsed.Longitude
        );

        long addressId = await _addressRepository.AddAndReturnIdAsync(address);

        // 5) Create Donor domain object
        var donor = DonorDomain.Create(reg.UserId, reg.TravelRadiusKm);
        donor.SetBloodType(reg.BloodTypeId);
        donor.SetAddress(addressId);

        // Set address display (IMPORTANT FIX)
        var fallbackDisplay = string.Join(", ", new[]
        {
            parsed.Line1,
            parsed.District,
            parsed.City,
            parsed.Province
        }.Where(x => !string.IsNullOrWhiteSpace(x)));

        donor.SetAddressDisplay(parsed.NormalizedAddress ?? fallbackDisplay);

        // Set geo location
        donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));

        // Donor mới luôn NOT READY
        donor.MarkReady(false);
        donor.UpdateEligibility(null);

        // 6) Availabilities
        if (reg.Availabilities != null)
        {
            foreach (var a in reg.Availabilities)
                donor.AddAvailability(DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin));
        }

        // 7) Health conditions
        if (reg.HealthConditionIds != null)
        {
            foreach (var id in reg.HealthConditionIds)
                donor.AddHealthCondition(DonorHealthConditionDomain.Create(0, id));
        }

        // 8) Save donor
        await _donorRepository.AddAsync(donor);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 9) Build response
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
