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
    public class GetMyRequestsQueryHandler : IRequestHandler<GetMyRequestsQuery, BaseResponse<List<RequestResponse>>>
    {
        private readonly IRequestRepository _requestRepository;

        public GetMyRequestsQueryHandler(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }

        public async Task<BaseResponse<List<RequestResponse>>> Handle(
            GetMyRequestsQuery query,
            CancellationToken cancellationToken)
        {
            var items = await _requestRepository.GetByRequesterIdAsync(query.userId);

            var dto = items.Select(r => new RequestResponse
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
                UpdatedAt = r.UpdatedAt
            }).ToList();

            return BaseResponse<List<RequestResponse>>.SuccessResponse(dto);
        }
    }
}
