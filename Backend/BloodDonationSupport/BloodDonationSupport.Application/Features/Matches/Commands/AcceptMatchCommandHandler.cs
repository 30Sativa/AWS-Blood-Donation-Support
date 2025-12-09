using BloodDonationSupport.Application.Common.Events;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public class AcceptMatchCommandHandler : IRequestHandler<AcceptMatchCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMatchEventPublisher _eventPublisher;

        public AcceptMatchCommandHandler(
            IMatchRepository matchRepo,
            IUnitOfWork unitOfWork,
            IMatchEventPublisher eventPublisher)
        {
            _matchRepo = matchRepo;
            _unitOfWork = unitOfWork;
            _eventPublisher = eventPublisher;
        }

        public async Task<BaseResponse<string>> Handle(
            AcceptMatchCommand request,
            CancellationToken cancellationToken)
        {
            var match = await _matchRepo.GetDomainByIdAsync(request.MatchId);

            if (match == null)
                return BaseResponse<string>.FailureResponse("Match not found.");

            try
            {
                match.Accept();
            }
            catch (DomainException ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }

            _matchRepo.UpdateDomain(match);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 🔥 Publish SNS event
            var evt = new MatchEventMessage
            {
                MatchId = match.Id,
                RequestId = match.RequestId,
                DonorId = match.DonorId,
                Event = "MATCH_ACCEPTED"
            };

            await _eventPublisher.PublishAsync(evt, "MATCH_ACCEPTED");

            return BaseResponse<string>.SuccessResponse("Match accepted successfully.");
        }
    }
}
