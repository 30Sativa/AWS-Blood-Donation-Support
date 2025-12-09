using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Common.Events;
using BloodDonationSupport.Domain.Common;
using MediatR;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public class DeclineMatchCommandHandler
        : IRequestHandler<DeclineMatchCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMatchEventPublisher _eventPublisher;

        public DeclineMatchCommandHandler(
            IMatchRepository matchRepo,
            IUnitOfWork unitOfWork,
            IMatchEventPublisher eventPublisher)
        {
            _matchRepo = matchRepo;
            _unitOfWork = unitOfWork;
            _eventPublisher = eventPublisher;
        }

        public async Task<BaseResponse<string>> Handle(
            DeclineMatchCommand request,
            CancellationToken cancellationToken)
        {
            var match = await _matchRepo.GetDomainByIdAsync(request.MatchId);

            if (match == null)
                return BaseResponse<string>.FailureResponse("Match not found.");

            try
            {
                match.Decline();
            }
            catch (DomainException ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }

            _matchRepo.UpdateDomain(match);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 🔥 SNS Event: DECLINED
            var evt = new MatchEventMessage
            {
                MatchId = match.Id,
                RequestId = match.RequestId,
                DonorId = match.DonorId,
                Event = "MATCH_DECLINED"
            };

            await _eventPublisher.PublishAsync(evt, "MATCH_DECLINED");

            return BaseResponse<string>.SuccessResponse("Match declined successfully.");
        }
    }
}
