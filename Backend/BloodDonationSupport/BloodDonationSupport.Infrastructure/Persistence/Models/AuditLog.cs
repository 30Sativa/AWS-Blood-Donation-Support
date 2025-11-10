namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class AuditLog
{
    public long AuditId { get; set; }

    public long? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string EntityType { get; set; } = null!;

    public string? EntityId { get; set; }

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public string? DetailsJson { get; set; }

    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; }
}