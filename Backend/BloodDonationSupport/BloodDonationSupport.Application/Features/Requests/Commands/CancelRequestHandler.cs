using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class CancelRequestHandler : IRequestHandler<CancelRequestCommand, BaseResponse<string>>
    {
        private readonly IRequestRepository _requestRepo;
        private readonly IUnitOfWork _uow;

        public CancelRequestHandler(IRequestRepository requestRepo, IUnitOfWork uow)
        {
            _requestRepo = requestRepo;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            CancelRequestCommand cmd,
            CancellationToken cancellationToken)
        {
            var request = await _requestRepo.GetByIdAsync(cmd.Request.RequestId);
            if (request == null)
                return BaseResponse<string>.FailureResponse("Request not found.");

            try
            {
                request.Cancel(""); // reason không dùng
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }

            _requestRepo.Update(request);
            await _uow.SaveChangesAsync();

            return BaseResponse<string>.SuccessResponse("Request cancelled successfully.");
        }
    }
}
