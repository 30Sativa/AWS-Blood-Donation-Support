using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Queries
{
    public record GetAllAddressesQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedResponse<AddressResponse>>;

    public class GetAllAddressesQueryHandler : IRequestHandler<GetAllAddressesQuery, PaginatedResponse<AddressResponse>>
    {
        private readonly IAddressRepository _addressRepository;

        public GetAllAddressesQueryHandler(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        public async Task<PaginatedResponse<AddressResponse>> Handle(GetAllAddressesQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _addressRepository.GetPagedAsync(request.PageNumber, request.PageSize);

            var addresses = items.Select(a => new AddressResponse
            {
                AddressId = a.AddressId!.Value,
                Line1 = a.Line1,
                District = a.District,
                City = a.City,
                Province = a.Province,
                Country = a.Country,
                PostalCode = a.PostalCode,
                NormalizedAddress = a.NormalizedAddress,
                PlaceId = a.PlaceId,
                ConfidenceScore = a.ConfidenceScore,
                Latitude = a.Latitude,
                Longitude = a.Longitude
            }).ToList();

            return new PaginatedResponse<AddressResponse>
            {
                Items = addresses,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }
    }
}

