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
    public class UpdateMyDonorAddressHandler : IRequestHandler<UpdateMyDonorAddressCommand, BaseResponse<string>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IUserRepository _userRepo;
        private readonly IDonorRepository _donorRepo;
        private readonly IAddressRepository _addressRepo;
        private readonly ILocationService _locationService;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateMyDonorAddressHandler(
            ICurrentUserService currentUser,
            IUserRepository userRepo,
            IDonorRepository donorRepo,
            IAddressRepository addressRepo,
            ILocationService locationService,
            IUnitOfWork unitOfWork)
        {
            _currentUser = currentUser;
            _userRepo = userRepo;
            _donorRepo = donorRepo;
            _addressRepo = addressRepo;
            _locationService = locationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateMyDonorAddressCommand request,
            CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated || string.IsNullOrEmpty(_currentUser.CognitoUserId))
                return BaseResponse<string>.FailureResponse("User is not authenticated.");

            var user = await _userRepo.GetByCognitoUserIdAsync(_currentUser.CognitoUserId);
            if (user == null)
                return BaseResponse<string>.FailureResponse("User not found.");

            var donor = await _donorRepo.GetByUserIdWithRelationsAsync(user.Id);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor profile not found.");

            // 1) Parse new address
            var parsed = await _locationService.ParseAddressAsync(request.Request.FullAddress);
            if (parsed == null)
                return BaseResponse<string>.FailureResponse("Invalid address.");

            // 2) Create NEW Address record
            var addressDomain = AddressDomain.Create(
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

            long newAddressId = await _addressRepo.AddAndReturnIdAsync(addressDomain);

            // 3) Update donor
            donor.SetAddress(newAddressId);
            donor.SetAddressDisplay(parsed.NormalizedAddress);
            donor.UpdateLocation(GeoLocation.Create(parsed.Latitude, parsed.Longitude));
            donor.MarkReady(true); // optional

            _donorRepo.Update(donor);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Address updated successfully.");
        }
    }
}
