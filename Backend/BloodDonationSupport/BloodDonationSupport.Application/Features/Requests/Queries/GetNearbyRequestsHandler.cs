using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetNearbyRequestsHandler
        : IRequestHandler<GetNearbyRequestsQuery, BaseResponse<IEnumerable<NearbyRequestResponse>>>
    {
        private readonly ILocationService _locationService;

        public GetNearbyRequestsHandler(ILocationService locationService)
        {
            _locationService = locationService;
        }

        public async Task<BaseResponse<IEnumerable<NearbyRequestResponse>>> Handle(
            GetNearbyRequestsQuery request,
            CancellationToken cancellationToken)
        {
            var nearbyRequests = await _locationService.GetNearbyRequestsAsync(
                request.request.Latitude,
                request.request.Longitude,
                request.request.RadiusKm);

            //  Null check
            if (nearbyRequests == null || !nearbyRequests.Any())
            {
                return BaseResponse<IEnumerable<NearbyRequestResponse>>.FailureResponse(
                    "No nearby requests found.");
            }

            //  Success response
            return BaseResponse<IEnumerable<NearbyRequestResponse>>.SuccessResponse(
                nearbyRequests,
                $"Found {nearbyRequests.Count()} requests within {request.request.RadiusKm} km.");
        }
    }
}
