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
    public class GetRequestByIdHandler : IRequestHandler<GetRequestByIdQuery, BaseResponse<RequestResponse>>
    {
        private readonly IRequestRepository _requestRepository;
        public GetRequestByIdHandler(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }
        public async Task<BaseResponse<RequestResponse>> Handle(GetRequestByIdQuery request, CancellationToken cancellationToken)
        {
            var reg = await _requestRepository.GetByIdAsync(request.RequestId);
            if(reg == null)
            {
                return BaseResponse<RequestResponse>.FailureResponse("Request not found.");
            }
            var repsone = new RequestResponse
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
                UpdatedAt = reg.UpdatedAt
            };

            return BaseResponse<RequestResponse>.SuccessResponse(repsone, "Request retrieved successfully.");
        }
    }
}
