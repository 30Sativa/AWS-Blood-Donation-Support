using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public record CreateMatchCommand(long RequestId, CreateMatchRequest Request)
        : IRequest<BaseResponse<MatchResponse>>;

    public class CreateMatchCommandHandler
        : IRequestHandler<CreateMatchCommand, BaseResponse<MatchResponse>>
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

        public async Task<BaseResponse<MatchResponse>> Handle(
            CreateMatchCommand command,
            CancellationToken cancellationToken)
        {
            // 1) Validate request exists
            var request = await _requestRepository.GetByIdAsync(command.RequestId);
            if (request == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Request not found.");
            }

            // 2) Validate donor exists
            var donor = await _donorRepository.GetByIdAsync(command.Request.DonorId);
            if (donor == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Donor not found.");
            }

            // 3) Check duplicate match
            var existingMatches = await _matchRepository.GetByRequestIdAsync(command.RequestId);
            if (existingMatches.Any(m => m.DonorId == command.Request.DonorId))
            {
                return BaseResponse<MatchResponse>
                    .FailureResponse("Match already exists for this request and donor.");
            }

            // 4) Build match data for insertion
            var matchData = new MatchData
            {
                RequestId = command.RequestId,
                DonorId = command.Request.DonorId,
                CompatibilityScore = command.Request.CompatibilityScore,
                DistanceKm = command.Request.DistanceKm,
                Status = command.Request.Status,
                Response = command.Request.Response,
                CreatedAt = DateTime.UtcNow,
                
            };

            try
            {
                // INSERT - repository chỉ Add, chưa SaveChanges
                var matchId = await _matchRepository.AddAsync(matchData);

                // SaveChanges do UnitOfWork xử lý
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Load lại từ DB
                var created = await _matchRepository.GetByIdAsync(matchId);

                if (created == null)
                    return BaseResponse<MatchResponse>.FailureResponse("Failed to retrieve created match.");

                var response = new MatchResponse
                {
                    MatchId = created.MatchId!.Value,
                    RequestId = created.RequestId,
                    DonorId = created.DonorId,
                    CompatibilityScore = created.CompatibilityScore,
                    DistanceKm = created.DistanceKm,
                    Status = created.Status,
                    ContactedAt = created.ContactedAt,
                    Response = created.Response,
                    CreatedAt = created.CreatedAt
                };

                return BaseResponse<MatchResponse>.SuccessResponse(response, "Match created successfully.");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating match");
                return BaseResponse<MatchResponse>.FailureResponse(
                    $"Error creating match: {ex.Message}"
                );
            }
        }
    }
}
