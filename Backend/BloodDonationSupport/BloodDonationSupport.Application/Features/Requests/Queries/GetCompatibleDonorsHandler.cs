using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Services;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetCompatibleDonorsHandler : IRequestHandler<GetCompatibleDonorsQuery, BaseResponse<CompatibleDonorsResponse>>
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
        public async Task<BaseResponse<CompatibleDonorsResponse>> Handle(GetCompatibleDonorsQuery Request, CancellationToken cancellationToken)
        {
            // 1) Get request info
            var request = await _requestRepo.GetByIdAsync(Request.RequestId);
            if (request == null)
                throw new Exception("Request not found");

            if (request.Location == null)
                throw new Exception("Request does not have a valid location.");

            // 2) Load blood compatibility rules
            var rules = await _compatRepo.GetRulesAsync(
                request.BloodTypeId,
                request.ComponentId
            );

            // Debug: Log rules found
            if (!rules.Any())
            {
                // No compatibility rules found for this blood type and component
                return new BaseResponse<CompatibleDonorsResponse>
                {
                    Success = true,
                    Message = $"No compatibility rules found for blood type ID {request.BloodTypeId} and component ID {request.ComponentId}.",
                    Data = new CompatibleDonorsResponse
                    {
                        RequestId = Request.RequestId,
                        Donors = new List<CompatibleDonorDto>()
                    }
                };
            }

            var compatibleTypes = rules
                .Where(r => _matchingService.IsCompatible(r))
                .Select(r => r.DonorBloodTypeId)
                .Distinct()
                .ToList();

            if (!compatibleTypes.Any())
            {
                // No compatible blood types found
                return new BaseResponse<CompatibleDonorsResponse>
                {
                    Success = true,
                    Message = $"No compatible blood types found for blood type ID {request.BloodTypeId} and component ID {request.ComponentId}.",
                    Data = new CompatibleDonorsResponse
                    {
                        RequestId = Request.RequestId,
                        Donors = new List<CompatibleDonorDto>()
                    }
                };
            }

            // 3) Load donors with these blood types
            var donors = await _donorRepo.GetDonorsByBloodTypesAsync(compatibleTypes);

            if (!donors.Any())
            {
                // No donors found with compatible blood types
                return new BaseResponse<CompatibleDonorsResponse>
                {
                    Success = true,
                    Message = $"No ready donors found with compatible blood types: {string.Join(", ", compatibleTypes)}.",
                    Data = new CompatibleDonorsResponse
                    {
                        RequestId = Request.RequestId,
                        Donors = new List<CompatibleDonorDto>()
                    }
                };
            }

            // 4) Calculate AWS distance + map DTO
            var dtoList = new List<CompatibleDonorDto>();

            foreach (var donor in donors)
            {
                if (donor.LastKnownLocation == null)
                    continue;

                var distance = await _awsLocation.CalculateDistanceKmAsync(
                    request.Location.Latitude,
                    request.Location.Longitude,
                    donor.LastKnownLocation.Latitude,
                    donor.LastKnownLocation.Longitude
                );

                dtoList.Add(new CompatibleDonorDto
                {
                    DonorId = donor.Id,
                    FullName = donor.User?.Profile?.FullName ?? "Unknow",
                    BloodGroup = donor.BloodType?.ToString() ?? "?",
                    DistanceKm = distance ?? 99999,
                    LastKnownLocation = donor.LastKnownLocation.ToString(),
                    IsReady = donor.IsReady
                });
            }

            var sorted = dtoList.OrderBy(x => x.DistanceKm).ToList();

            return new BaseResponse<CompatibleDonorsResponse>
            {
                Success = true,
                Data = new CompatibleDonorsResponse
                {
                    RequestId = Request.RequestId,
                    Donors = sorted
                }
            };
        }
    }
}