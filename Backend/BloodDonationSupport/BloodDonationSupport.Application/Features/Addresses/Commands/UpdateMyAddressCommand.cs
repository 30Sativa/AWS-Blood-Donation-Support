using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Commands
{
    public record UpdateMyAddressCommand(UpdateAddressRequest Request) : IRequest<BaseResponse<AddressResponse>>;

    public class UpdateMyAddressCommandHandler : IRequestHandler<UpdateMyAddressCommand, BaseResponse<AddressResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IDonorRepository _donorRepository;
        private readonly IAddressRepository _addressRepository;

        public UpdateMyAddressCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IDonorRepository donorRepository,
            IAddressRepository addressRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _donorRepository = donorRepository;
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<AddressResponse>> Handle(UpdateMyAddressCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<AddressResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("User not found.");
            }

            var donor = await _donorRepository.GetByUserIdAsync(user.Id);
            if (donor == null || !donor.AddressId.HasValue)
            {
                return BaseResponse<AddressResponse>.FailureResponse("User does not have an address. Please create an address first.");
            }

            var existingAddress = await _addressRepository.GetByIdAsync(donor.AddressId.Value);
            if (existingAddress == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Address not found.");
            }

            var addressData = new AddressData
            {
                AddressId = donor.AddressId.Value,
                Line1 = request.Request.Line1 ?? existingAddress.Line1,
                District = request.Request.District ?? existingAddress.District,
                City = request.Request.City ?? existingAddress.City,
                Province = request.Request.Province ?? existingAddress.Province,
                Country = request.Request.Country ?? existingAddress.Country,
                PostalCode = request.Request.PostalCode ?? existingAddress.PostalCode,
                NormalizedAddress = request.Request.NormalizedAddress ?? existingAddress.NormalizedAddress,
                PlaceId = request.Request.PlaceId ?? existingAddress.PlaceId,
                ConfidenceScore = request.Request.ConfidenceScore ?? existingAddress.ConfidenceScore,
                Latitude = request.Request.Latitude ?? existingAddress.Latitude,
                Longitude = request.Request.Longitude ?? existingAddress.Longitude
            };

            var updated = await _addressRepository.UpdateAsync(donor.AddressId.Value, addressData);
            if (!updated)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Failed to update address.");
            }

            var updatedAddress = await _addressRepository.GetByIdAsync(donor.AddressId.Value);
            if (updatedAddress == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Failed to retrieve updated address.");
            }

            var response = new AddressResponse
            {
                AddressId = updatedAddress.AddressId!.Value,
                Line1 = updatedAddress.Line1,
                District = updatedAddress.District,
                City = updatedAddress.City,
                Province = updatedAddress.Province,
                Country = updatedAddress.Country,
                PostalCode = updatedAddress.PostalCode,
                NormalizedAddress = updatedAddress.NormalizedAddress,
                PlaceId = updatedAddress.PlaceId,
                ConfidenceScore = updatedAddress.ConfidenceScore,
                Latitude = updatedAddress.Latitude,
                Longitude = updatedAddress.Longitude
            };

            return BaseResponse<AddressResponse>.SuccessResponse(response, "Address updated successfully.");
        }
    }
}

