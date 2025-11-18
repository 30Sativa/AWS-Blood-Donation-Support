using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _context;

        public AppointmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<long> AddAsync(AppointmentData appointment)
        {
            var entity = new Appointment
            {
                RequestId = appointment.RequestId,
                DonorId = appointment.DonorId,
                ScheduledAt = appointment.ScheduledAt,
                LocationId = appointment.LocationId,
                Status = appointment.Status,
                CreatedBy = appointment.CreatedBy,
                CreatedAt = appointment.CreatedAt
            };

            await _context.Appointments.AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity.AppointmentId;
        }

        public async Task<AppointmentData?> GetByIdAsync(long appointmentId)
        {
            var entity = await _context.Appointments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

            if (entity == null)
                return null;

            return new AppointmentData
            {
                AppointmentId = entity.AppointmentId,
                RequestId = entity.RequestId,
                DonorId = entity.DonorId,
                ScheduledAt = entity.ScheduledAt,
                LocationId = entity.LocationId,
                Status = entity.Status,
                CreatedBy = entity.CreatedBy,
                CreatedAt = entity.CreatedAt
            };
        }

        public async Task<IEnumerable<AppointmentData>> GetByRequestIdAsync(long requestId)
        {
            var entities = await _context.Appointments
                .AsNoTracking()
                .Where(a => a.RequestId == requestId)
                .ToListAsync();

            return entities.Select(e => new AppointmentData
            {
                AppointmentId = e.AppointmentId,
                RequestId = e.RequestId,
                DonorId = e.DonorId,
                ScheduledAt = e.ScheduledAt,
                LocationId = e.LocationId,
                Status = e.Status,
                CreatedBy = e.CreatedBy,
                CreatedAt = e.CreatedAt
            });
        }

        public async Task<IEnumerable<AppointmentData>> GetByDonorIdAsync(long donorId)
        {
            var entities = await _context.Appointments
                .AsNoTracking()
                .Where(a => a.DonorId == donorId)
                .ToListAsync();

            return entities.Select(e => new AppointmentData
            {
                AppointmentId = e.AppointmentId,
                RequestId = e.RequestId,
                DonorId = e.DonorId,
                ScheduledAt = e.ScheduledAt,
                LocationId = e.LocationId,
                Status = e.Status,
                CreatedBy = e.CreatedBy,
                CreatedAt = e.CreatedAt
            });
        }
    }
}

