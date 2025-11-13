using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class RegisterRequestCommandHandler : IRequestHandler<RegisterRequestCommand, BaseResponse<RegisterRequestResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<RegisterRequestCommandHandler> _logger;

        public RegisterRequestCommandHandler(
            IUnitOfWork unitOfWork,
            IRequestRepository requestRepository,
            IUserRepository userRepository,
            ILogger<RegisterRequestCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _requestRepository = requestRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<BaseResponse<RegisterRequestResponse>> Handle(RegisterRequestCommand request, CancellationToken cancellationToken)
        {
            var dto = request.request;

            // ====== 1️⃣ Log DTO đầu vào ======
            _logger.LogInformation("🧩 RegisterRequest started: User={UserId}, BloodType={BloodTypeId}, Component={ComponentId}, Address={AddressId}",
                dto.RequesterUserId, dto.BloodTypeId, dto.ComponentId, dto.DeliveryAddressId);

            // ====== 2️⃣ Kiểm tra người dùng ======
            var user = await _userRepository.GetByIdAsync(dto.RequesterUserId);
            if (user == null)
            {
                _logger.LogWarning("❌ Requester user not found: {UserId}", dto.RequesterUserId);
                return BaseResponse<RegisterRequestResponse>.FailureResponse($"Requester user {dto.RequesterUserId} not found.");
            }

            // ====== 3️⃣ Parse urgency ======
            if (!Enum.TryParse(dto.Urgency, true, out UrgencyLevel urgency))
            {
                urgency = UrgencyLevel.NORMAL;
                _logger.LogWarning("⚠️ Invalid urgency string '{Urgency}', fallback to NORMAL", dto.Urgency);
            }

            // ====== 4️⃣ Tạo domain entity ======
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

            // ====== 5️⃣ SaveChanges có try/catch để log lỗi thật ======
            try
            {
                await _requestRepository.AddAsync(newRequest);
                _logger.LogInformation("💾 RequestDomain added to DbContext, saving...");
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                var fullError = ex.InnerException?.Message ?? ex.Message;
                _logger.LogError(ex, "❌ EF Save Error: {Error}", fullError);
                Console.WriteLine($"❌ EF Save Error: {fullError}");
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Save failed: " + fullError);
            }

            // ====== 6️⃣ Nếu cần, log ID sinh ra ======
            var requestId = newRequest.Id;
            _logger.LogInformation("✅ Request saved successfully with ID={RequestId}", requestId);

            // ====== 7️⃣ Chuẩn bị response ======
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

            _logger.LogInformation("🎉 Request registration completed successfully for user {UserId}", dto.RequesterUserId);
            return BaseResponse<RegisterRequestResponse>.SuccessResponse(response, "Request registered successfully.");
        }
    }
}
