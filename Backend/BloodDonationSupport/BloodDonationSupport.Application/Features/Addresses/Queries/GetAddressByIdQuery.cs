using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Queries
{
    public record GetAddressByIdQuery(long AddressId) : IRequest<BaseResponse<AddressResponse>>;

    public class GetAddressByIdQueryHandler : IRequestHandler<GetAddressByIdQuery, BaseResponse<AddressResponse>>
    {
        private readonly IAddressRepository _addressRepository;

        public GetAddressByIdQueryHandler(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<AddressResponse>> Handle(GetAddressByIdQuery request, CancellationToken cancellationToken)
        {
            var address = await _addressRepository.GetByIdAsync(request.AddressId);
            if (address == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Address not found.");
            }

            var response = new AddressResponse
            {
                AddressId = address.AddressId!.Value,
                Line1 = address.Line1,
                District = address.District,
                City = address.City,
                Province = address.Province,
                Country = address.Country,
                PostalCode = address.PostalCode,
                NormalizedAddress = address.NormalizedAddress,
                PlaceId = address.PlaceId,
                ConfidenceScore = address.ConfidenceScore,
                Latitude = address.Latitude,
                Longitude = address.Longitude
            };

            return BaseResponse<AddressResponse>.SuccessResponse(response);
        }
    }
}

