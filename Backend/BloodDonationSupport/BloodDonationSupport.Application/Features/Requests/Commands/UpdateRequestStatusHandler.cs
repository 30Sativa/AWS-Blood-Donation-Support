using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class UpdateRequestStatusHandler : IRequestHandler<UpdateRequestStatusCommand, BaseResponse<string>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateRequestStatusHandler(IRequestRepository requestRepository, IUnitOfWork unitOfWork)
        {
            _requestRepository = requestRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(UpdateRequestStatusCommand request, CancellationToken cancellationToken)
        {
            var dto = request.request;

            var requestDomain = await _requestRepository.GetByIdAsync(request.request.RequestId);
            if (requestDomain == null)
                return BaseResponse<string>.FailureResponse($"Request with ID {request.request.RequestId} not found.");

            // Gọi domain behavior (tự bắn event RequestStatusChangedEvent)
            requestDomain.UpdateStatus(dto.NewStatus);

            _requestRepository.Update(requestDomain);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                $"Request status updated to {dto.NewStatus}."
            );
        }
    }
}