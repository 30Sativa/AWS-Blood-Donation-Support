using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetRequestByIdHandler : IRequestHandler<GetRequestByIdQuery, BaseResponse<RequestResponse>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IAddressRepository _addressRepository;

        public GetRequestByIdHandler(
            IRequestRepository requestRepository,
            IAddressRepository addressRepository)
        {
            _requestRepository = requestRepository;
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<RequestResponse>> Handle(GetRequestByIdQuery request, CancellationToken cancellationToken)
        {
            // 1) Lấy request
            var reg = await _requestRepository.GetByIdAsync(request.RequestId);
            if (reg == null)
                return BaseResponse<RequestResponse>.FailureResponse("Request not found.");

            // 2) Lấy địa chỉ nếu có
            var address = reg.DeliveryAddressId.HasValue
                ? await _addressRepository.GetByIdAsync(reg.DeliveryAddressId.Value)
                : null;

            // 3) Map DTO
            var response = new RequestResponse
            {
                RequestId = reg.Id,
                RequesterUserId = reg.RequesterUserId,
                Urgency = reg.Urgency.ToString(),
                BloodTypeId = reg.BloodTypeId,
                ComponentId = reg.ComponentId,
                QuantityUnits = reg.QuantityUnits,
                NeedBeforeUtc = reg.NeedBeforeUtc,
                DeliveryAddressId = reg.DeliveryAddressId,
                Status = reg.Status.ToString(),
                ClinicalNotes = reg.ClinicalNotes,
                CreatedAt = reg.CreatedAt,
                UpdatedAt = reg.UpdatedAt,

                // 🆕 Thông tin địa chỉ
                DeliveryAddressName = address == null
        ? null
        : $"{address.Line1}, {address.District}, {address.City}, {address.Province}",

                Latitude = address?.Latitude,
                Longitude = address?.Longitude
            };


            return BaseResponse<RequestResponse>.SuccessResponse(response, "Request retrieved successfully.");
        }
    }
}