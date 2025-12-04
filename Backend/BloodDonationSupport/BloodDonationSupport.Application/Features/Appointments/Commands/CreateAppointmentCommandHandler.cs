using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using BloodDonationSupport.Domain.Appointments.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Appointments.Commands
{
    public class CreateAppointmentCommandHandler :
        IRequestHandler<CreateAppointmentCommand, BaseResponse<AppointmentResponse>>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IDonorRepository _donorRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateAppointmentCommandHandler(
            IRequestRepository requestRepository,
            IDonorRepository donorRepository,
            IMatchRepository matchRepository,
            IAppointmentRepository appointmentRepository,
            IUnitOfWork unitOfWork)
        {
            _requestRepository = requestRepository;
            _donorRepository = donorRepository;
            _matchRepository = matchRepository;
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<AppointmentResponse>> Handle(
            CreateAppointmentCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            // 1. Validate request exists
            var request = await _requestRepository.GetByIdAsync(req.RequestId);
            if (request == null)
                return BaseResponse<AppointmentResponse>.FailureResponse("Request not found.");

            // 2. Validate donor exists
            var donor = await _donorRepository.GetByIdAsync(req.DonorId);
            if (donor == null)
                return BaseResponse<AppointmentResponse>.FailureResponse("Donor not found.");

            // 3. Validate match exists for this request and donor (optional, but enforced here)
            var match = await _matchRepository.GetDtoByRequestIdAndDonorIdAsync(req.RequestId, req.DonorId);
            if (match == null)
                return BaseResponse<AppointmentResponse>.FailureResponse("Match not found for this request and donor.");

            // 4. Create domain appointment
            var appointment = AppointmentDomain.Create(
                req.RequestId,
                req.DonorId,
                req.LocationId,
                req.ScheduledAt,
                req.Notes,
                req.CreatedBy
            );

            await _appointmentRepository.AddAsync(appointment);
            try
            {
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.Message
              + " | STACK: "
              + ex.InnerException?.StackTrace;

                return BaseResponse<AppointmentResponse>.FailureResponse(msg ?? ex.Message);
            }

            // Retrieve the saved appointment to get the generated ID
            var savedAppointment = await _appointmentRepository.GetLatestDtoByRequestIdAndDonorIdAsync(
                req.RequestId, 
                req.DonorId);

            if (savedAppointment == null)
            {
                return BaseResponse<AppointmentResponse>.FailureResponse(
                    "Failed to retrieve created appointment.");
            }

            // Update domain entity with the generated ID
            appointment.SetId(savedAppointment.AppointmentId);

            return BaseResponse<AppointmentResponse>.SuccessResponse(
                savedAppointment,
                "Appointment created successfully.");
        }
    }
}
