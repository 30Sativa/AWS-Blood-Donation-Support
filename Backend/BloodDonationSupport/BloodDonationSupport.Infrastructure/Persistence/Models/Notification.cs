using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Notification
{
    public long NotificationId { get; set; }

    public long UserId { get; set; }

    public string Channel { get; set; } = null!;

    public string TemplateCode { get; set; } = null!;

    public string? PayloadJson { get; set; }

    public string Status { get; set; } = null!;

    public string? AwsMessageId { get; set; }

    public string? DeliveryStatus { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime? OpenedAt { get; set; }

    public DateTime? ClickedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? SentAt { get; set; }

    public virtual User User { get; set; } = null!;
}
