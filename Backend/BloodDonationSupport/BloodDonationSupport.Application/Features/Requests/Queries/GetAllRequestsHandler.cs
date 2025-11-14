using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetAllRequestsHandler : IRequestHandler<GetAllRequestsQuery, PaginatedResponse<RequestResponse>>
    {
        private readonly IRequestRepository _requestRepository;


        public GetAllRequestsHandler(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
        }


        public async Task<PaginatedResponse<RequestResponse>> Handle(GetAllRequestsQuery request, CancellationToken cancellationToken)
        {
            var requests = await _requestRepository.GetAllAsync();

            var data = requests.Select(r => new RequestResponse
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
