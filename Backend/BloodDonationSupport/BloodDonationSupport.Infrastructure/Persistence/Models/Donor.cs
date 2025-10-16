using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Donor
{
    public long DonorId { get; set; }

    public long UserId { get; set; }

    public int? BloodTypeId { get; set; }

    public long? AddressId { get; set; }

    public decimal TravelRadiusKm { get; set; }

    public DateOnly? NextEligibleDate { get; set; }

    public bool IsReady { get; set; }

    public DateTime? LocationUpdatedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Address? Address { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual BloodType? BloodType { get; set; }

    public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();

    public virtual ICollection<DonorAvailability> DonorAvailabilities { get; set; } = new List<DonorAvailability>();

    public virtual ICollection<Match> Matches { get; set; } = new List<Match>();

    public virtual ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();

    public virtual User User { get; set; } = null!;
}
