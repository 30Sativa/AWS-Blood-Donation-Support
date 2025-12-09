using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Matches.DTOs.Request;
using BloodDonationSupport.Application.Features.Matches.DTOs.Response;
using BloodDonationSupport.Domain.Matches.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Matches.Commands.CreateMatch
{
    public record CreateMatchCommand(CreateMatchRequest Request)
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
            if (command.Request is null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Request payload cannot be null.");
            }

            var request = await _requestRepository.GetByIdAsync(command.Request.RequestId);
            if (request == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Request not found.");
            }

            var donor = await _donorRepository.GetByIdAsync(command.Request.DonorId);
            if (donor == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Donor not found.");
            }

            var duplicate = await _matchRepository.GetDtoByRequestIdAndDonorIdAsync(
                command.Request.RequestId,
                command.Request.DonorId);
            if (duplicate != null)
            {
                return BaseResponse<MatchResponse>.FailureResponse(
                    "Match already exists for this request and donor.");
            }

            var match = MatchDomain.Create(
                command.Request.RequestId,
                command.Request.DonorId,
                command.Request.CompatibilityScore,
                command.Request.DistanceKm);

            try
            {
                await _matchRepository.AddDomainAsync(match);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating match");
                return BaseResponse<MatchResponse>.FailureResponse($"Error creating match: {ex.Message}");
            }

            if (match.Id == 0)
            {
                var createdSnapshot = await _matchRepository.GetDtoByRequestIdAndDonorIdAsync(
                    command.Request.RequestId,
                    command.Request.DonorId);

                if (createdSnapshot?.MatchId is null)
                {
                    return BaseResponse<MatchResponse>.FailureResponse("Failed to retrieve created match.");
                }

                match.SetId(createdSnapshot.MatchId.Value);
            }

            var persisted = await _matchRepository.GetDomainByIdAsync(match.Id);
            if (persisted == null)
            {
                return BaseResponse<MatchResponse>.FailureResponse("Failed to retrieve created match.");
            }

            var response = new MatchResponse
            {
                MatchId = persisted.Id,
                RequestId = persisted.RequestId,
                DonorId = persisted.DonorId,
                CompatibilityScore = persisted.CompatibilityScore,
                DistanceKm = persisted.DistanceKm,
                Status = persisted.Status,
                ContactedAt = persisted.ContactedAt,
                Response = persisted.Response,
                CreatedAt = persisted.CreatedAt
            };

            return BaseResponse<MatchResponse>.SuccessResponse(response, "Match created successfully.");
        }
    }
}

