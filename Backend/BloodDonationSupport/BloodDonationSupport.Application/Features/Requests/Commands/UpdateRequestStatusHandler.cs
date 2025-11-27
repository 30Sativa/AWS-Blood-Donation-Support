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

        public UpdateRequestStatusHandler(IRequestRepository requestRepository, IUnitOfWork unitOfWork)
        {
            _requestRepository = requestRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(UpdateRequestStatusCommand request, CancellationToken cancellationToken)
        {
            //  Lấy request theo ID
            var requestDomain = await _requestRepository.GetByIdAsync(request.requestid);
            if (requestDomain == null)
            {
                return BaseResponse<string>.FailureResponse(
                    $"Request with ID {request.requestid} not found.");
            }

            //  Parse enum từ string (case-insensitive)
            if (!Enum.TryParse<RequestStatus>(request.request.NewStatus, true, out var status))
            {
                return BaseResponse<string>.FailureResponse(
                    $"Invalid status value '{request.request.NewStatus}'. Valid values: REQUESTED, MATCHING, FULFILLED, CANCELLED, EXPIRED.");
            }

            //  Gọi domain behavior (phát event RequestStatusChangedEvent nếu có)
            requestDomain.UpdateStatus(status);

            //  Cập nhật repository + commit
            _requestRepository.Update(requestDomain);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            //  Trả response thành công
            return BaseResponse<string>.SuccessResponse(
                $"Request status updated successfully.",
                $"Status changed to {status}");
        }
    }
}