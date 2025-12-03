using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Commands
{
    public class ContactMatchCommandHandler : IRequestHandler<ContactMatchCommand, BaseResponse<string>>
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ContactMatchCommandHandler(IMatchRepository matchRepository, IUnitOfWork unitOfWork)
        {
            _matchRepository = matchRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<BaseResponse<string>> Handle(ContactMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await _matchRepository.GetDomainByIdAsync(request.MatchId);
            if(match == null)
            {
                return BaseResponse<string>.FailureResponse("Match not found.");
            }
            try
            {
                match.MarkContacted();
            }
            catch(Exception ex)
            {
                return BaseResponse<string>.FailureResponse($"Error contacting match: {ex.Message}");
            }
            _matchRepository.UpdateDomain(match);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return BaseResponse<string>.SuccessResponse("Match contacted successfully.");
        }
    }
}
