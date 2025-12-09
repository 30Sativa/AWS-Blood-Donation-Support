using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateDonorCommandHandler : IRequestHandler<UpdateDonorCommand, BaseResponse<string>>
    {

        private readonly IDonorRepository _donorRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ILocationService _locationService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateDonorCommandHandler(
            IDonorRepository donorRepository,
            IAddressRepository addressRepository,
            ILocationService locationService,
            IUnitOfWork unitOfWork)
        {
            _donorRepository = donorRepository;
            _addressRepository = addressRepository;
            _locationService = locationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(UpdateDonorCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdWithRelationsAsync(request.donorId);

            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // ❗ Rule: Không cho update khi đang sẵn sàng hiến
            if (donor.IsReady)
                return BaseResponse<string>.FailureResponse("Cannot update donor while IsReady = true.");

            var req = request.Request;

            // ==================================================
            // 1. Parse address từ AWS
            // ==================================================
            var parsed = await _locationService.ParseAddressAsync(req.FullAddress);
            if (parsed == null)
                return BaseResponse<string>.FailureResponse("Invalid address.");

            // ==================================================
            // 2. Lưu Address mới & lấy ID
            // ==================================================
            var addressDomain = AddressDomain.Create(
                parsed.Line1, parsed.District, parsed.City, parsed.Province,
                parsed.Country, parsed.PostalCode, parsed.NormalizedAddress,
                parsed.PlaceId,
                parsed.ConfidenceScore.HasValue ? (decimal?)parsed.ConfidenceScore.Value : null,
                parsed.Latitude, parsed.Longitude
            );

            long newAddressId = await _addressRepository.AddAndReturnIdAsync(addressDomain);

            // ==================================================
            // 3. Update donor domain
            // ==================================================
            donor.SetBloodType(req.BloodTypeId);
            donor.SetAddress(newAddressId);
            donor.UpdateTravelRadius(req.TravelRadiusKm);

            donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));

            // Reset availability
            donor.ClearAvailabilities();
            foreach (var a in req.Availabilities)
            {
                donor.AddAvailability(
                    DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin)
                );
            }

            // Reset health conditions
            donor.ClearHealthConditions();
            foreach (var cond in req.HealthConditionIds)
            {
                donor.AddHealthCondition(DonorHealthConditionDomain.Create(donor.Id, cond));
            }

            // ==================================================
            // 4. SAVE
            // ==================================================
            _donorRepository.Update(donor);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                "Donor updated successfully."
            );
        }
    }
}