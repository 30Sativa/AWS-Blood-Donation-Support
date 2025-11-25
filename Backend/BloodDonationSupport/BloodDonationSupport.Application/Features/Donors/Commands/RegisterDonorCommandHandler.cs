using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;

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

    public async Task<BaseResponse<RegisterDonorResponse>> Handle(RegisterDonorCommand request, CancellationToken cancellationToken)
    {
        var reg = request.request;

        // 1) Check user exists
        var user = await _userRepository.GetByIdAsync(reg.UserId);
        if (user == null)
            return BaseResponse<RegisterDonorResponse>.FailureResponse("User not found.");

        // 2) Check donor exists (đã fix ExistsAsync ở repo)
        if (await _donorRepository.ExistsAsync(d => d.UserId == reg.UserId))
            return BaseResponse<RegisterDonorResponse>.FailureResponse("Donor profile already exists.");

        // 3) Parse address via AWS Location
        var parsed = await _locationService.ParseAddressAsync(reg.FullAddress);
        if (parsed == null)
            return BaseResponse<RegisterDonorResponse>.FailureResponse("Invalid address.");

        // Build fallback if AWS thiếu field
        string fallbackDisplay = string.Join(", ", new[]
        {
            parsed.Line1, parsed.District, parsed.City, parsed.Province
        }.Where(x => !string.IsNullOrWhiteSpace(x)));

        // 4) Save Address first
        var address = AddressDomain.Create(
            parsed.Line1,
            parsed.District,
            parsed.City,
            parsed.Province,
            parsed.Country,
            parsed.PostalCode,
            parsed.NormalizedAddress ?? fallbackDisplay, // đảm bảo không null
            parsed.PlaceId,
            (decimal?)parsed.ConfidenceScore,
            parsed.Latitude,
            parsed.Longitude
        );

        long addressId = await _addressRepository.AddAndReturnIdAsync(address);

        // 5) Create Donor (Clean Domain)
        var donor = DonorDomain.Create(reg.UserId, reg.TravelRadiusKm);
        donor.SetBloodType(reg.BloodTypeId);
        donor.SetAddress(addressId);
        donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));
        donor.MarkReady(false);           // new donor không sẵn sàng
        donor.UpdateEligibility(null);    // chưa từng hiến máu

        // 6) Add Availabilities
        if (reg.Availabilities != null)
        {
            foreach (var a in reg.Availabilities)
            {
                donor.AddAvailability(DonorAvailability.Create(
                    a.Weekday, a.TimeFromMin, a.TimeToMin));
            }
        }

        // 7) Add Health Conditions (không cần DonorId tại thời điểm này)
        if (reg.HealthConditionIds != null)
        {
            foreach (var id in reg.HealthConditionIds)
            {
                donor.AddHealthCondition(DonorHealthConditionDomain.Create(0,id));
            }
        }

        // 8) Save Donor
        await _donorRepository.AddAsync(donor);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 9) Response
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

            // Return display cho FE
            AddressDisplay = parsed.NormalizedAddress ?? fallbackDisplay,

            Availabilities = donor.Availabilities.Select(x => new DonorAvailabilityResponse
            {
                Weekday = x.Weekday,
                TimeFromMin = x.TimeFromMin,
                TimeToMin = x.TimeToMin
            }).ToList(),

            HealthConditions = donor.HealthConditions.Select(h => new DonorHealthConditionItemResponse
            {
                ConditionId = h.ConditionId,
                ConditionName = h.ConditionName
            }).ToList()
        };

        return BaseResponse<RegisterDonorResponse>.SuccessResponse(response, "Donor registered successfully.");
    }
}
