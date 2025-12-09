using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using BloodDonationSupport.Domain.Appointments.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAppointmentRepository
    {
        // Domain methods
        Task AddAsync(AppointmentDomain appointment);
        Task<AppointmentDomain?> GetByIdAsync(long appointmentId);
        void Update(AppointmentDomain appointment);

        // DTO read models
        Task<AppointmentResponse?> GetDtoByIdAsync(long appointmentId);
        Task<IEnumerable<AppointmentResponse>> GetDtosByRequestIdAsync(long requestId);
        Task<AppointmentResponse?> GetLatestDtoByRequestIdAndDonorIdAsync(long requestId, long donorId);
    }
}