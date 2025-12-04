using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Appointments.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Appointments.Commands
{
    public class UpdateAppointmentStatusCommandHandler : IRequestHandler<UpdateAppointmentStatusCommand, BaseResponse<string>>
    {

        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateAppointmentStatusCommandHandler(
            IAppointmentRepository appointmentRepo,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepo = appointmentRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateAppointmentStatusCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            // 1. Get domain entity
            var appt = await _appointmentRepo.GetByIdAsync(command.AppointmentId);
            if (appt == null)
                return BaseResponse<string>.FailureResponse("Appointment not found.");

            // 2. Validate status
            var status = req.Status.ToUpperInvariant();
            if (status != AppointmentStatus.CHECKED_IN &&
                status != AppointmentStatus.NO_SHOW &&
                status != AppointmentStatus.CANCELLED)
            {
                return BaseResponse<string>.FailureResponse("Invalid appointment status.");
            }

            // 3. Apply domain behavior
            switch (status)
            {
                case AppointmentStatus.CHECKED_IN:
                    appt.MarkCheckedIn();
                    break;

                case AppointmentStatus.NO_SHOW:
                    appt.MarkNoShow();
                    break;

                case AppointmentStatus.CANCELLED:
                    appt.MarkCancelled();
                    break;
            }

            // 4. Save to DB
            _appointmentRepo.Update(appt);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                "Appointment status updated successfully.");
        }
    }
}
