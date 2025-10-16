using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Reminder
{
    public long ReminderId { get; set; }

    public long DonorId { get; set; }

    public string ReminderType { get; set; } = null!;

    public DateTime TargetDate { get; set; }

    public DateTime? SentAt { get; set; }

    public bool IsSnoozed { get; set; }

    public DateTime? SnoozeUntil { get; set; }

    public string? ProcessedBatchId { get; set; }

    public int RetryCount { get; set; }

    public DateTime? LastAttemptAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Donor Donor { get; set; } = null!;
}
