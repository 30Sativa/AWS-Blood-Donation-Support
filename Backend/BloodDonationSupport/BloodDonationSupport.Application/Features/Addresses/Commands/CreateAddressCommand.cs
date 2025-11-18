using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Request;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Addresses.Commands
{
    public record CreateAddressCommand(CreateAddressRequest Request) : IRequest<BaseResponse<AddressResponse>>;

    public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, BaseResponse<AddressResponse>>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ILogger<CreateAddressCommandHandler> _logger;

        public CreateAddressCommandHandler(
            IAddressRepository addressRepository,
            ILogger<CreateAddressCommandHandler> logger)
        {
            _addressRepository = addressRepository;
            _logger = logger;
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

            try
            {
                var addressId = await _addressRepository.AddAsync(addressData);
                _logger.LogInformation("Address created with ID: {AddressId}", addressId);

                var createdAddress = await _addressRepository.GetByIdAsync(addressId);
                if (createdAddress == null)
                {
                    _logger.LogWarning("Address created but could not be retrieved. AddressId: {AddressId}", addressId);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating address");
                return BaseResponse<AddressResponse>.FailureResponse($"Error creating address: {ex.Message}");
            }
        }
    }
}

