using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Appointments.DTOs.Response;
using BloodDonationSupport.Domain.Appointments.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // Domain methods
    // =========================
    public async Task AddAsync(AppointmentDomain domain)
    {
        var ef = new Appointment
        {
            RequestId = domain.RequestId,
            DonorId = domain.DonorId,
            LocationId = domain.LocationId,
            ScheduledAt = domain.ScheduledAt,
            Notes = domain.Notes,
            Status = domain.Status,
            CreatedBy = domain.CreatedBy,
            CreatedAt = domain.CreatedAt
        };

        await _context.Appointments.AddAsync(ef);
        // Note: ID will be set after SaveChangesAsync is called
        // The AppointmentId will be populated by EF Core after saving
    }

    public async Task<AppointmentDomain?> GetByIdAsync(long appointmentId)
    {
        var e = await _context.Appointments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

        if (e == null) return null;

        return AppointmentDomain.Rehydrate(
            e.AppointmentId,
            e.RequestId,
            e.DonorId,
            e.LocationId,
            e.ScheduledAt,
            e.Notes,
            e.Status,
            e.CreatedAt,
            e.CreatedBy
        );
    }

    public void Update(AppointmentDomain domain)
    {
        var ef = _context.Appointments.First(a => a.AppointmentId == domain.Id);
        ef.Status = domain.Status;
        ef.Notes = domain.Notes;
    }

    // =========================
    // DTO read models
    // =========================
    public async Task<AppointmentResponse?> GetDtoByIdAsync(long appointmentId)
    {
        return await _context.Appointments
            .AsNoTracking()
            .Where(a => a.AppointmentId == appointmentId)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                RequestId = a.RequestId,
                DonorId = a.DonorId,
                LocationId = a.LocationId,
                ScheduledAt = a.ScheduledAt,
                Notes = a.Notes,
                Status = a.Status,
                CreatedBy = a.CreatedBy,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<AppointmentResponse>> GetDtosByRequestIdAsync(long requestId)
    {
        return await _context.Appointments
            .AsNoTracking()
            .Where(a => a.RequestId == requestId)
            .OrderBy(a => a.ScheduledAt)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                RequestId = a.RequestId,
                DonorId = a.DonorId,
                LocationId = a.LocationId,
                ScheduledAt = a.ScheduledAt,
                Notes = a.Notes,
                Status = a.Status,
                CreatedBy = a.CreatedBy,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AppointmentResponse?> GetLatestDtoByRequestIdAndDonorIdAsync(long requestId, long donorId)
    {
        return await _context.Appointments
            .AsNoTracking()
            .Where(a => a.RequestId == requestId && a.DonorId == donorId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                RequestId = a.RequestId,
                DonorId = a.DonorId,
                LocationId = a.LocationId,
                ScheduledAt = a.ScheduledAt,
                Notes = a.Notes,
                Status = a.Status,
                CreatedBy = a.CreatedBy,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync();
    }
}
