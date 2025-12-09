using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetRequestsByUserIdHandler
    : IRequestHandler<GetRequestsByUserIdQuery, BaseResponse<List<RequestResponse>>>
    {
        private readonly IRequestRepository _requestRepo;
        private readonly IAddressRepository _addressRepository;

        public GetRequestsByUserIdHandler(
            IRequestRepository requestRepo,
            IAddressRepository addressRepository)
        {
            _requestRepo = requestRepo;
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<List<RequestResponse>>> Handle(
            GetRequestsByUserIdQuery query,
            CancellationToken cancellationToken)
        {
            var items = await _requestRepo.FindByUserIdAsync(query.UserId);

            // Lấy tất cả address IDs duy nhất từ requests
            var addressIds = items
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
            var dto = items.Select(r =>
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

            return BaseResponse<List<RequestResponse>>.SuccessResponse(dto);
        }
    }
}
