using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Requests.Enums;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class UpdateRequestStatusHandler
        : IRequestHandler<UpdateRequestStatusCommand, BaseResponse<string>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateRequestStatusHandler(
            IRequestRepository requestRepository,
            IUnitOfWork unitOfWork)
        {
            _requestRepository = requestRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateRequestStatusCommand command,
            CancellationToken cancellationToken)
        {
            var req = await _requestRepository.GetByIdAsync(command.requestid);
            if (req == null)
                return BaseResponse<string>.FailureResponse("Request not found.");

            if (!Enum.TryParse(command.request.NewStatus, true, out RequestStatus newStatus))
                return BaseResponse<string>.FailureResponse("Invalid status.");

            try
            {
                switch (newStatus)
                {
                    case RequestStatus.MATCHING:
                        req.StartMatching();
                        break;

                    case RequestStatus.FULFILLED:
                        req.Fulfill();
                        break;

                    case RequestStatus.CANCELLED:
                        req.Cancel("Cancelled manually");
                        break;

                    case RequestStatus.REQUESTED:
                        return BaseResponse<string>.FailureResponse("Cannot set status to REQUESTED.");
                }

                _requestRepository.Update(req);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return BaseResponse<string>.SuccessResponse(
                    "Status updated successfully.",
                    $"New status: {req.Status}"
                );
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }
        }
    }
}
