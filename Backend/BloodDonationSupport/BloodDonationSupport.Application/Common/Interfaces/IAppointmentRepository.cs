using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAppointmentRepository
    {
        Task<long> AddAsync(AppointmentData appointment);
        Task<AppointmentData?> GetByIdAsync(long appointmentId);
        Task<IEnumerable<AppointmentData>> GetByRequestIdAsync(long requestId);
        Task<IEnumerable<AppointmentData>> GetByDonorIdAsync(long donorId);
    }
}

