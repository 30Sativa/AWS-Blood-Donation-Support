using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Common.Events;
using BloodDonationSupport.Domain.Common;
using MediatR;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public class MarkNoAnswerCommandHandler
        : IRequestHandler<MarkNoAnswerCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMatchEventPublisher _eventPublisher;

        public MarkNoAnswerCommandHandler(
            IMatchRepository matchRepo,
            IUnitOfWork unitOfWork,
            IMatchEventPublisher eventPublisher)
        {
            _matchRepo = matchRepo;
            _unitOfWork = unitOfWork;
            _eventPublisher = eventPublisher;
        }

        public async Task<BaseResponse<string>> Handle(
            MarkNoAnswerCommand request,
            CancellationToken cancellationToken)
        {
            var match = await _matchRepo.GetDomainByIdAsync(request.MatchId);

            if (match == null)
                return BaseResponse<string>.FailureResponse("Match not found.");

            try
            {
                match.MarkNoAnswer();
            }
            catch (DomainException ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }

            _matchRepo.UpdateDomain(match);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 🔥 SNS Event: NO_ANSWER
            var evt = new MatchEventMessage
            {
                MatchId = match.Id,
                RequestId = match.RequestId,
                DonorId = match.DonorId,
                Event = "MATCH_NO_ANSWER"
            };

            await _eventPublisher.PublishAsync(evt, "MATCH_NO_ANSWER");

            return BaseResponse<string>.SuccessResponse("Match marked as no-answer.");
        }
    }
}
