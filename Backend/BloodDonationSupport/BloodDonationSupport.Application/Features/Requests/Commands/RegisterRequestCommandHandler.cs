using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
using BloodDonationSupport.Domain.Addresses.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class RegisterRequestCommandHandler
        : IRequestHandler<RegisterRequestCommand, BaseResponse<RegisterRequestResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ILocationService _locationService;
        private readonly ILogger<RegisterRequestCommandHandler> _logger;

        public RegisterRequestCommandHandler(
            IUnitOfWork unitOfWork,
            IRequestRepository requestRepository,
            IUserRepository userRepository,
            IAddressRepository addressRepository,
            ILocationService locationService,
            ILogger<RegisterRequestCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _addressRepository = addressRepository;
            _locationService = locationService;
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

            // 2) Parse urgency
            if (!Enum.TryParse(dto.Urgency, true, out UrgencyLevel urgency))
                urgency = UrgencyLevel.NORMAL;

            // ⭐ 3) Resolve Address
            long finalAddressId;

            if (dto.DeliveryAddressId.HasValue && dto.DeliveryAddressId.Value > 0)
            {
                // CASE A: FE gửi AddressId → dùng luôn
                var existing = await _addressRepository.GetByIdAsync(dto.DeliveryAddressId.Value);
                if (existing == null)
                    return BaseResponse<RegisterRequestResponse>.FailureResponse("Delivery address not found.");

                finalAddressId = existing.Id;
            }
            else
            {
                // CASE B: FE gửi text → backend tự tạo Address
                if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
                    return BaseResponse<RegisterRequestResponse>.FailureResponse(
                        "Either DeliveryAddressId or DeliveryAddress is required."
                    );

                var parsed = await _locationService.ParseAddressAsync(dto.DeliveryAddress);
                if (parsed == null)
                    return BaseResponse<RegisterRequestResponse>.FailureResponse("Invalid delivery address.");

                var newAddress = AddressDomain.Create(
                    parsed.Line1,
                    parsed.District,
                    parsed.City,
                    parsed.Province,
                    parsed.Country,
                    parsed.PostalCode,
                    parsed.NormalizedAddress,
                    parsed.PlaceId,
                    (decimal?)parsed.ConfidenceScore,
                    parsed.Latitude,
                    parsed.Longitude
                );

                finalAddressId = await _addressRepository.AddAndReturnIdAsync(newAddress);
            }

            // ⭐ 4) Create request domain
            var newRequest = RequestDomain.Create(
                dto.RequesterUserId,
                urgency,
                dto.BloodTypeId,
                dto.ComponentId,
                dto.QuantityUnits,
                dto.NeedBeforeUtc,
                finalAddressId,
                dto.ClinicalNotes
            );

            // Kiểm tra toạ độ address
            var addr = await _addressRepository.GetByIdAsync(finalAddressId);
            if (addr == null || addr.Latitude == 0 || addr.Longitude == 0)
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Address does not contain coordinates.");

            newRequest.SetLocation(addr.Latitude, addr.Longitude);

            // ⭐ 5) Start matching pipeline
            newRequest.StartMatching();

            // ⭐ 6) Save
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

            // ⭐ 7) Build response
            var response = new RegisterRequestResponse
            {
                RequestId = newRequest.Id,
                RequesterUserId = newRequest.RequesterUserId,
                Urgency = newRequest.Urgency.ToString(),
                BloodTypeId = newRequest.BloodTypeId,
                ComponentId = newRequest.ComponentId,
                QuantityUnits = newRequest.QuantityUnits,
                Status = newRequest.Status.ToString(),
                CreatedAt = newRequest.CreatedAt,
                UpdatedAt = newRequest.UpdatedAt
            };

            return BaseResponse<RegisterRequestResponse>.SuccessResponse(
                response,
                "Request registered successfully."
            );
        }
    }
}
