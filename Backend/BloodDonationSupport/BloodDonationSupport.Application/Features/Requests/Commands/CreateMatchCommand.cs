using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public record CreateMatchCommand(long RequestId, CreateMatchRequest Request) : IRequest<BaseResponse<MatchResponse>>;

    public class CreateMatchCommandHandler : IRequestHandler<CreateMatchCommand, BaseResponse<MatchResponse>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IDonorRepository _donorRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CreateMatchCommandHandler> _logger;

        public CreateMatchCommandHandler(
            IRequestRepository requestRepository,
            IDonorRepository donorRepository,
            IMatchRepository matchRepository,
            IUnitOfWork unitOfWork,
            ILogger<CreateMatchCommandHandler> logger)
        {
            _requestRepository = requestRepository;
            _donorRepository = donorRepository;
            _matchRepository = matchRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<BaseResponse<MatchResponse>> Handle(CreateMatchCommand command, CancellationToken cancellationToken)
        {
            // Validate request exists
            var request = await _requestRepository.GetByIdAsync(command.RequestId);
            if (request == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Request not found.");
            }

            // Validate donor exists
            var donor = await _donorRepository.GetByIdAsync(command.Request.DonorId);
            if (donor == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Donor not found.");
            }

            // Check if match already exists
            var existingMatches = await _matchRepository.GetByRequestIdAsync(command.RequestId);
            if (existingMatches.Any(m => m.DonorId == command.Request.DonorId))
            {
                return BaseResponse<MatchResponse>.FailureResponse("Match already exists for this request and donor.");
            }

            var matchData = new MatchData
            {
                RequestId = command.RequestId,
                DonorId = command.Request.DonorId,
                CompatibilityScore = command.Request.CompatibilityScore,
                DistanceKm = command.Request.DistanceKm,
                Status = command.Request.Status,
                Response = command.Request.Response,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                var matchId = await _matchRepository.AddAsync(matchData);
                _logger.LogInformation("Match created with ID: {MatchId} for RequestId: {RequestId}, DonorId: {DonorId}",
                    matchId, command.RequestId, command.Request.DonorId);

                var createdMatch = await _matchRepository.GetByIdAsync(matchId);
                if (createdMatch == null)
                {
                    return BaseResponse<MatchResponse>.FailureResponse("Failed to retrieve created match.");
                }

                var response = new MatchResponse
                {
                    MatchId = createdMatch.MatchId!.Value,
                    RequestId = createdMatch.RequestId,
                    DonorId = createdMatch.DonorId,
                    CompatibilityScore = createdMatch.CompatibilityScore,
                    DistanceKm = createdMatch.DistanceKm,
                    Status = createdMatch.Status,
                    ContactedAt = createdMatch.ContactedAt,
                    Response = createdMatch.Response,
                    CreatedAt = createdMatch.CreatedAt
                };

                return BaseResponse<MatchResponse>.SuccessResponse(response, "Match created successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating match");
                return BaseResponse<MatchResponse>.FailureResponse($"Error creating match: {ex.Message}");
            }
        }
    }
}