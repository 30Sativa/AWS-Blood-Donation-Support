namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class RequestEvent
{
    public long EventId { get; set; }

    public long RequestId { get; set; }

    public string EventCode { get; set; } = null!;

    public long? ChangedBy { get; set; }

    public string? Reason { get; set; }

    public string? DetailsJson { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? ChangedByNavigation { get; set; }

    public virtual Request Request { get; set; } = null!;
}