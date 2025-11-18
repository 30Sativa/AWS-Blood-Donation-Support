using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Commands
{
    public record CreateAddressCommand(CreateAddressRequest Request) : IRequest<BaseResponse<AddressResponse>>;

    public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, BaseResponse<AddressResponse>>
    {
        private readonly IAddressRepository _addressRepository;

        public CreateAddressCommandHandler(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<AddressResponse>> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
        {
            var addressData = new AddressData
            {
                Line1 = request.Request.Line1,
                District = request.Request.District,
                City = request.Request.City,
                Province = request.Request.Province,
                Country = request.Request.Country ?? "Vietnam",
                PostalCode = request.Request.PostalCode,
                NormalizedAddress = request.Request.NormalizedAddress,
                PlaceId = request.Request.PlaceId,
                ConfidenceScore = request.Request.ConfidenceScore,
                Latitude = request.Request.Latitude,
                Longitude = request.Request.Longitude
            };

            var addressId = await _addressRepository.AddAsync(addressData);

            var createdAddress = await _addressRepository.GetByIdAsync(addressId);
            if (createdAddress == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Failed to create address.");
            }

            var response = new AddressResponse
            {
                AddressId = createdAddress.AddressId!.Value,
                Line1 = createdAddress.Line1,
                District = createdAddress.District,
                City = createdAddress.City,
                Province = createdAddress.Province,
                Country = createdAddress.Country,
                PostalCode = createdAddress.PostalCode,
                NormalizedAddress = createdAddress.NormalizedAddress,
                PlaceId = createdAddress.PlaceId,
                ConfidenceScore = createdAddress.ConfidenceScore,
                Latitude = createdAddress.Latitude,
                Longitude = createdAddress.Longitude
            };

            return BaseResponse<AddressResponse>.SuccessResponse(response, "Address created successfully.");
        }
    }
}

