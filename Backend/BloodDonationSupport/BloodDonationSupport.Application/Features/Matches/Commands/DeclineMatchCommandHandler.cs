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
    public class DeclineMatchCommandHandler : IRequestHandler<DeclineMatchCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepo;
        private readonly IUnitOfWork _unitOfWork;

        public DeclineMatchCommandHandler(
            IMatchRepository matchRepo, IUnitOfWork unitOfWork)
        {
            _matchRepo = matchRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(DeclineMatchCommand request, CancellationToken cancellationToken)
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

            return BaseResponse<string>.SuccessResponse("Match declined successfully.");
        }
    }
}