using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Request;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.Appointments.Commands
{
    public record CreateAppointmentCommand(CreateAppointmentRequest Request) : IRequest<BaseResponse<AppointmentResponse>>;

    public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, BaseResponse<AppointmentResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IRequestRepository _requestRepository;
        private readonly IDonorRepository _donorRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ILogger<CreateAppointmentCommandHandler> _logger;

        public CreateAppointmentCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IRequestRepository requestRepository,
            IDonorRepository donorRepository,
            IAppointmentRepository appointmentRepository,
            ILogger<CreateAppointmentCommandHandler> logger)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _requestRepository = requestRepository;
            _donorRepository = donorRepository;
            _appointmentRepository = appointmentRepository;
            _logger = logger;
        }

        public async Task<BaseResponse<AppointmentResponse>> Handle(CreateAppointmentCommand command, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<AppointmentResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<AppointmentResponse>.FailureResponse("User not found.");
            }

            // Validate request exists
            var request = await _requestRepository.GetByIdAsync(command.Request.RequestId);
            if (request == null)
            {
                return BaseResponse<AppointmentResponse>.FailureResponse("Request not found.");
            }

            // Validate donor exists
            var donor = await _donorRepository.GetByIdAsync(command.Request.DonorId);
            if (donor == null)
            {
                return BaseResponse<AppointmentResponse>.FailureResponse("Donor not found.");
            }

            // Validate scheduled time is in the future
            if (command.Request.ScheduledAt <= DateTime.UtcNow)
            {
                return BaseResponse<AppointmentResponse>.FailureResponse("Scheduled time must be in the future.");
            }

            var appointmentData = new AppointmentData
            {
                RequestId = command.Request.RequestId,
                DonorId = command.Request.DonorId,
                ScheduledAt = command.Request.ScheduledAt,
                LocationId = command.Request.LocationId,
                Status = command.Request.Status,
                CreatedBy = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                var appointmentId = await _appointmentRepository.AddAsync(appointmentData);
                _logger.LogInformation("Appointment created with ID: {AppointmentId} for RequestId: {RequestId}, DonorId: {DonorId}",
                    appointmentId, command.Request.RequestId, command.Request.DonorId);

                var createdAppointment = await _appointmentRepository.GetByIdAsync(appointmentId);
                if (createdAppointment == null)
                {
                    return BaseResponse<AppointmentResponse>.FailureResponse("Failed to retrieve created appointment.");
                }

                var response = new AppointmentResponse
                {
                    AppointmentId = createdAppointment.AppointmentId!.Value,
                    RequestId = createdAppointment.RequestId,
                    DonorId = createdAppointment.DonorId,
                    ScheduledAt = createdAppointment.ScheduledAt,
                    LocationId = createdAppointment.LocationId,
                    Status = createdAppointment.Status,
                    CreatedBy = createdAppointment.CreatedBy,
                    CreatedAt = createdAppointment.CreatedAt
                };

                return BaseResponse<AppointmentResponse>.SuccessResponse(response, "Appointment created successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return BaseResponse<AppointmentResponse>.FailureResponse($"Error creating appointment: {ex.Message}");
            }
        }
    }
}