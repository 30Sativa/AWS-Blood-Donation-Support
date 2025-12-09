using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetAllRequestsHandler : IRequestHandler<GetAllRequestsQuery, PaginatedResponse<RequestResponse>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IAddressRepository _addressRepository;

        public GetAllRequestsHandler(
            IRequestRepository requestRepository,
            IAddressRepository addressRepository)
        {
            _requestRepository = requestRepository;
            _addressRepository = addressRepository;
        }

        public async Task<PaginatedResponse<RequestResponse>> Handle(GetAllRequestsQuery request, CancellationToken cancellationToken)
        {
            var requests = await _requestRepository.GetAllAsync();

            // Lấy tất cả address IDs duy nhất từ requests
            var addressIds = requests
                .Where(r => r.DeliveryAddressId.HasValue)
                .Select(r => r.DeliveryAddressId!.Value)
                .Distinct()
                .ToList();

            // Fetch tất cả addresses một lần
            var addressesDict = new Dictionary<long, Domain.Addresses.Entities.AddressDomain>();
            foreach (var addressId in addressIds)
            {
                var address = await _addressRepository.GetByIdAsync(addressId);
                if (address != null)
                {
                    addressesDict[addressId] = address;
                }
            }

            // Map requests với address information
            var data = requests.Select(r =>
            {
                var address = r.DeliveryAddressId.HasValue && addressesDict.TryGetValue(r.DeliveryAddressId.Value, out var addr)
                    ? addr
                    : null;

                return new RequestResponse
                {
                    RequestId = r.Id,
                    RequesterUserId = r.RequesterUserId,
                    Urgency = r.Urgency.ToString(),
                    BloodTypeId = r.BloodTypeId,
                    ComponentId = r.ComponentId,
                    QuantityUnits = r.QuantityUnits,
                    NeedBeforeUtc = r.NeedBeforeUtc,
                    DeliveryAddressId = r.DeliveryAddressId,
                    Status = r.Status.ToString(),
                    ClinicalNotes = r.ClinicalNotes,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,

                    // 🆕 Thông tin địa chỉ
                    DeliveryAddressName = address == null
                        ? null
                        : $"{address.Line1}, {address.District}, {address.City}, {address.Province}",
                    Latitude = address?.Latitude,
                    Longitude = address?.Longitude
                };
            }).ToList();

            return new PaginatedResponse<RequestResponse>
            {
                Items = data,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = data.Count
            };
        }
    }
}