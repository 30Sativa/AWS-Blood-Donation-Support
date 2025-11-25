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
        private readonly IUnitOfWork _uow;

        public UpdateMyDonorAddressHandler(
            ICurrentUserService currentUser,
            IUserRepository userRepo,
            IDonorRepository donorRepo,
            IAddressRepository addressRepo,
            ILocationService locationService,
            IUnitOfWork uow)
        {
            _currentUser = currentUser;
            _userRepo = userRepo;
            _donorRepo = donorRepo;
            _addressRepo = addressRepo;
            _locationService = locationService;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateMyDonorAddressCommand cmd, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated || string.IsNullOrEmpty(_currentUser.CognitoUserId))
                return BaseResponse<string>.FailureResponse("User is not authenticated.");

            var user = await _userRepo.GetByCognitoUserIdAsync(_currentUser.CognitoUserId);
            if (user == null)
                return BaseResponse<string>.FailureResponse("User not found.");

            var donor = await _donorRepo.GetByUserIdAsync(user.Id);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor profile not found.");

            var parsed = await _locationService.ParseAddressAsync(cmd.Request.FullAddress);
            if (parsed == null)
                return BaseResponse<string>.FailureResponse("Unable to parse address.");

            var newAddress = AddressDomain.Create(
                parsed.Line1,
                parsed.District,
                parsed.City,
                parsed.Province,
                parsed.Country,
                parsed.PostalCode,
                parsed.NormalizedAddress,
                parsed.PlaceId,
                parsed.ConfidenceScore.HasValue ? (decimal?)parsed.ConfidenceScore.Value : null,
                parsed.Latitude,
                parsed.Longitude
            );

            await _addressRepo.AddAsync(newAddress);

            donor.SetAddress(newAddress.Id);
            donor.UpdateLocation(
                GeoLocation.Create(parsed.Latitude, parsed.Longitude)
            );

            _donorRepo.Update(donor);
            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Address updated successfully.");
        }
    }
}
