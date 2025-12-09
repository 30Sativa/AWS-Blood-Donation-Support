using BloodDonationSupport.Infrastructure.Persistence.Models;
using System.ComponentModel.DataAnnotations.Schema;

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

    public string? Notes { get; set; }

    [ForeignKey(nameof(CreatedBy))]
    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<DonationAttempt> DonationAttempts { get; set; } = new List<DonationAttempt>();
    public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();

    [ForeignKey(nameof(DonorId))]
    public virtual Donor Donor { get; set; } = null!;

    [ForeignKey(nameof(LocationId))]
    public virtual Address? Location { get; set; }

    [ForeignKey(nameof(RequestId))]
    public virtual Request Request { get; set; } = null!;
}
