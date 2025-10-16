using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class BloodComponent
{
    public int ComponentId { get; set; }

    public string ComponentCode { get; set; } = null!;

    public string ComponentName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<CompatibilityMatrix> CompatibilityMatrices { get; set; } = new List<CompatibilityMatrix>();

    public virtual ComponentShelfLife? ComponentShelfLife { get; set; }

    public virtual ICollection<InventoryUnit> InventoryUnits { get; set; } = new List<InventoryUnit>();

    public virtual RecoveryPolicy? RecoveryPolicy { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();
}
