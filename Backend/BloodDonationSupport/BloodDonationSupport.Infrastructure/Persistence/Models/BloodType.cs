using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class BloodType
{
    public int BloodTypeId { get; set; }

    public string Abo { get; set; } = null!;

    public string Rh { get; set; } = null!;

    public virtual ICollection<CompatibilityMatrix> CompatibilityMatrixFromBloodTypes { get; set; } = new List<CompatibilityMatrix>();

    public virtual ICollection<CompatibilityMatrix> CompatibilityMatrixToBloodTypes { get; set; } = new List<CompatibilityMatrix>();

    public virtual ICollection<Donor> Donors { get; set; } = new List<Donor>();

    public virtual ICollection<InventoryUnit> InventoryUnits { get; set; } = new List<InventoryUnit>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();
}
