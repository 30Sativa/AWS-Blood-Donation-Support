using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Appointment
{
    public long AppointmentId { get; set; }

    public long RequestId { get; set; }

    public long DonorId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public long? LocationId { get; set; }

    public string Status { get; set; } = null!;

    public long CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<DonationAttempt> DonationAttempts { get; set; } = new List<DonationAttempt>();

    public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();

    public virtual Donor Donor { get; set; } = null!;

    public virtual Address? Location { get; set; }

    public virtual Request Request { get; set; } = null!;
}
