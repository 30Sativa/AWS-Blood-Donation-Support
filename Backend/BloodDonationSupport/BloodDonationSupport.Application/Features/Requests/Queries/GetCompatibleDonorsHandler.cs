using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Services;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetCompatibleDonorsHandler
        : IRequestHandler<GetCompatibleDonorsQuery, BaseResponse<CompatibleDonorsResponse>>
    {
        private readonly IRequestRepository _requestRepo;
        private readonly ICompatibilityRepository _compatRepo;
        private readonly IDonorRepository _donorRepo;
        private readonly BloodMatchingService _matchingService;
        private readonly IAwsRouteCalculator _awsLocation;

        public GetCompatibleDonorsHandler(
            IRequestRepository requestRepo,
            ICompatibilityRepository compatRepo,
            IDonorRepository donorRepo,
            IAwsRouteCalculator awsLocation)
        {
            _requestRepo = requestRepo;
            _compatRepo = compatRepo;
            _donorRepo = donorRepo;
            _matchingService = new BloodMatchingService();
            _awsLocation = awsLocation;
        }

        public async Task<BaseResponse<CompatibleDonorsResponse>> Handle(
            GetCompatibleDonorsQuery query,
            CancellationToken cancellationToken)
        {
            // 1) LOAD REQUEST
            var request = await _requestRepo.GetByIdAsync(query.RequestId);
            if (request == null)
                return BaseResponse<CompatibleDonorsResponse>.FailureResponse("Request not found.");

            if (request.Location == null)
                return BaseResponse<CompatibleDonorsResponse>.FailureResponse("Request does not have a valid geolocation.");


            // 2) COMPATIBILITY RULES
            var rules = await _compatRepo.GetRulesAsync(request.BloodTypeId, request.ComponentId);

            var compatibleTypes = rules
                .Where(r => r.IsCompatible)
                .Select(r => r.DonorBloodTypeId)
                .Distinct()
                .ToList();

            if (!compatibleTypes.Any())
            {
                return BaseResponse<CompatibleDonorsResponse>.SuccessResponse(
                    new CompatibleDonorsResponse
                    {
                        RequestId = query.RequestId,
                        Donors = new List<CompatibleDonorDto>()
                    },
                    "No compatible blood types found."
                );
            }


            // 3) LOAD DONORS (all donors with compatible blood types)
            var donors = await _donorRepo.GetDonorsByBloodTypesAsync(compatibleTypes);

            // ========== IMPORTANT DOMAIN FILTERS (YOU MISSED THESE) ==========

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            donors = donors
                .Where(d => d.IsReady)
                .Where(d => d.LastKnownLocation != null)
                .Where(d => d.NextEligibleDate == null || d.NextEligibleDate <= today)
                .ToList();


            if (!donors.Any())
            {
                return BaseResponse<CompatibleDonorsResponse>.SuccessResponse(
                    new CompatibleDonorsResponse
                    {
                        RequestId = query.RequestId,
                        Donors = new List<CompatibleDonorDto>()
                    },
                    "No eligible donors found."
                );
            }


            // 4) AWS ROUTE DISTANCE — MAP DTOs
            var resultList = new List<CompatibleDonorDto>();

            foreach (var donor in donors)
            {
                var distance = await _awsLocation.CalculateDistanceKmAsync(
                    request.Location.Latitude,
                    request.Location.Longitude,
                    donor.LastKnownLocation.Latitude,
                    donor.LastKnownLocation.Longitude
                );

                // Skip donors AWS cannot calculate distance
                if (distance == null)
                    continue;

                resultList.Add(new CompatibleDonorDto
                {
                    DonorId = donor.Id,
                    FullName = donor.User?.Profile?.FullName ?? "Unknown",
                    BloodGroup = donor.BloodType?.ToString() ?? "?",
                    DistanceKm = distance.Value,
                    LastKnownLocation = donor.LastKnownLocation.ToString(),
                    IsReady = donor.IsReady
                });
            }

            // 5) ORDER BEST DONORS FIRST
            resultList = resultList
                .OrderBy(x => x.DistanceKm)
                .ToList();


            // 6) RETURN
            return BaseResponse<CompatibleDonorsResponse>.SuccessResponse(
                new CompatibleDonorsResponse
                {
                    RequestId = query.RequestId,
                    Donors = resultList
                }
            );
        }
    }
}
