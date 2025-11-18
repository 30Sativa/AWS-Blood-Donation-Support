using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Commands
{
    public record UpdateAddressCommand(long AddressId, UpdateAddressRequest Request) : IRequest<BaseResponse<AddressResponse>>;

    public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, BaseResponse<AddressResponse>>
    {
        private readonly IAddressRepository _addressRepository;

        public UpdateAddressCommandHandler(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<AddressResponse>> Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
        {
            var existingAddress = await _addressRepository.GetByIdAsync(request.AddressId);
            if (existingAddress == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Address not found.");
            }

            var addressData = new AddressData
            {
                AddressId = request.AddressId,
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

            var updated = await _addressRepository.UpdateAsync(request.AddressId, addressData);
            if (!updated)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Failed to update address.");
            }

            var updatedAddress = await _addressRepository.GetByIdAsync(request.AddressId);
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

