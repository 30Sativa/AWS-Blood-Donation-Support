using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Donation
{
    public long DonationId { get; set; }

    public long DonorId { get; set; }

    public long? AppointmentId { get; set; }

    public string? ComponentType { get; set; }

    public DateTime CollectedAt { get; set; }

    public int? VolumeMl { get; set; }

    public int? UnitsDonated { get; set; }

    public string? Notes { get; set; }

    public long CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Appointment? Appointment { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual Donor Donor { get; set; } = null!;

    public virtual ICollection<InventoryUnit> InventoryUnits { get; set; } = new List<InventoryUnit>();
}
