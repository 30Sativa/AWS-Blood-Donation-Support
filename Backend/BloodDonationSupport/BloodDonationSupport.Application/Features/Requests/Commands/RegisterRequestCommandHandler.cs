using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class RegisterRequestCommandHandler
        : IRequestHandler<RegisterRequestCommand, BaseResponse<RegisterRequestResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ILogger<RegisterRequestCommandHandler> _logger;

        public RegisterRequestCommandHandler(
            IUnitOfWork unitOfWork,
            IRequestRepository requestRepository,
            IUserRepository userRepository,
            IAddressRepository addressRepository,
            ILogger<RegisterRequestCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _logger = logger;
        }

        public async Task<BaseResponse<RegisterRequestResponse>> Handle(
            RegisterRequestCommand command,
            CancellationToken cancellationToken)
        {
            var dto = command.request;

            // 1) Validate requester
            var user = await _userRepository.GetByIdAsync(dto.RequesterUserId);
            if (user == null)
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Requester not found.");

            // 2) Validate urgency
            if (!Enum.TryParse(dto.Urgency, true, out UrgencyLevel urgency))
                urgency = UrgencyLevel.NORMAL;

            // 3) Validate address
            if (dto.DeliveryAddressId == null)
                return BaseResponse<RegisterRequestResponse>.FailureResponse("DeliveryAddressId is required.");

            var address = await _addressRepository.GetByIdAsync(dto.DeliveryAddressId.Value);
            if (address == null)
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Delivery address not found.");

            // 4) Create domain entity
            var newRequest = RequestDomain.Create(
                dto.RequesterUserId,
                urgency,
                dto.BloodTypeId,
                dto.ComponentId,
                dto.QuantityUnits,
                dto.NeedBeforeUtc,
                dto.DeliveryAddressId,
                dto.ClinicalNotes
            );

            // 5) Set location from Address
            if (address.Latitude == 0 || address.Longitude == 0)
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Address does not contain coordinates.");

            newRequest.SetLocation(address.Latitude, address.Longitude);

            // 6) Start matching pipeline
            newRequest.StartMatching();

            try
            {
                await _requestRepository.AddAsync(newRequest);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                var err = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "Error saving request");
                return BaseResponse<RegisterRequestResponse>.FailureResponse(err);
            }

            // 7) Response
            var response = new RegisterRequestResponse
            {
                RequestId = newRequest.Id,
                RequesterUserId = newRequest.RequesterUserId,
                Urgency = newRequest.Urgency.ToString(),
                BloodTypeId = newRequest.BloodTypeId,
                ComponentId = newRequest.ComponentId,
                QuantityUnits = newRequest.QuantityUnits,
                Status = newRequest.Status.ToString(),
                CreatedAt = newRequest.CreatedAt
            };

            return BaseResponse<RegisterRequestResponse>.SuccessResponse(
                response,
                "Request registered successfully."
            );
        }
    }
}
