namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class FailedLoginAttempt
{
    public long AttemptId { get; set; }

    public string Email { get; set; } = null!;

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public DateTime AttemptedAt { get; set; }
}