using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetNearbyDonorsHandler : IRequestHandler<GetNearbyDonorsQuery, BaseResponse<List<NearbyDonorResponse>>>
    {
        private readonly ILocationService _locationService;

        public GetNearbyDonorsHandler(ILocationService locationService)
        {
            _locationService = locationService;
        }
        public async Task<BaseResponse<List<NearbyDonorResponse>>> Handle(GetNearbyDonorsQuery request, CancellationToken cancellationToken)
        {
            var donors = await _locationService.GetNearbyDonorsAsync(request.Request.Latitude, request.Request.Longitude, request.Request.RadiusKm);
            if (donors == null || donors.Count == 0)
            {
                return BaseResponse<List<NearbyDonorResponse>>.FailureResponse(
                    "No donors found within the specified radius.");
            }
            return BaseResponse<List<NearbyDonorResponse>>.SuccessResponse(
                donors,
                $"Found {donors.Count} donors within {request.Request.RadiusKm} km.");
        }
    }
}
