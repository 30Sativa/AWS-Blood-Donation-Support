using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateDonorLocationHandler : IRequestHandler<UpdateDonorLocationCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _uow;
        private readonly IDonorRepository _donorRepo;
        private readonly IAddressRepository _addressRepo;
        private readonly ILocationService _locationService;

        public UpdateDonorLocationHandler(
            IUnitOfWork uow,
            IDonorRepository donorRepo,
            IAddressRepository addressRepo,
            ILocationService locationService)
        {
            _uow = uow;
            _donorRepo = donorRepo;
            _addressRepo = addressRepo;
            _locationService = locationService;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateDonorLocationCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            var donor = await _donorRepo.GetByIdAsync(req.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found");

            // 1) Parse address using AWS
            var parsed = await _locationService.ParseAddressAsync(req.FullAddress);
            if (parsed == null)
                return BaseResponse<string>.FailureResponse("Unable to parse address");

            // 2) Create new address entry
            var addressDomain = AddressDomain.Create(
                line1: parsed.Line1,
                district: parsed.District,
                city: parsed.City,
                province: parsed.Province,
                country: parsed.Country,
                postalCode: parsed.PostalCode,
                normalizedAddress: parsed.NormalizedAddress,
                placeId: parsed.PlaceId,
                confidenceScore: parsed.ConfidenceScore.HasValue ? (decimal?)parsed.ConfidenceScore.Value : null,
                latitude: parsed.Latitude,
                longitude: parsed.Longitude
            );

            var addressId = await _addressRepo.AddAndReturnIdAsync(addressDomain);

            // 3) Update donor
            donor.SetAddress(addressId);
            donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));

            _donorRepo.Update(donor);
            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                "Donor location updated successfully.");
        }
    }
}
