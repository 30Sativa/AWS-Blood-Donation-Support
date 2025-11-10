namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class DonationAttempt
{
    public long AttemptId { get; set; }

    public long AppointmentId { get; set; }

    public string Status { get; set; } = null!;

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;
}