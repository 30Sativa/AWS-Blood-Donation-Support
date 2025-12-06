using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Common.Events;
using MediatR;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public class ContactMatchCommandHandler
        : IRequestHandler<ContactMatchCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMatchEventPublisher _eventPublisher;

        public ContactMatchCommandHandler(
            IMatchRepository matchRepository,
            IUnitOfWork unitOfWork,
            IMatchEventPublisher eventPublisher)
        {
            _matchRepository = matchRepository;
            _unitOfWork = unitOfWork;
            _eventPublisher = eventPublisher;
        }

        public async Task<BaseResponse<string>> Handle(
            ContactMatchCommand request,
            CancellationToken cancellationToken)
        {
            var match = await _matchRepository.GetDomainByIdAsync(request.MatchId);

            if (match == null)
                return BaseResponse<string>.FailureResponse("Match not found.");

            try
            {
                match.MarkContacted();
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse($"Error contacting match: {ex.Message}");
            }

            _matchRepository.UpdateDomain(match);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 🔥 SNS Event: CONTACTED
            var evt = new MatchEventMessage
            {
                MatchId = match.Id,
                RequestId = match.RequestId,
                DonorId = match.DonorId,
                Event = "MATCH_CONTACTED"
            };

            await _eventPublisher.PublishAsync(evt, "MATCH_CONTACTED");

            return BaseResponse<string>.SuccessResponse("Match contacted successfully.");
        }
    }
}
