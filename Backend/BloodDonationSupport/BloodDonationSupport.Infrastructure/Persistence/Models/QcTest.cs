using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class QcTest
{
    public long QcId { get; set; }

    public long UnitId { get; set; }

    public string QcStatus { get; set; } = null!;

    public string? ResultsJson { get; set; }

    public DateTime? TestedAt { get; set; }

    public long? TestedBy { get; set; }

    public string? Notes { get; set; }

    public virtual User? TestedByNavigation { get; set; }

    public virtual InventoryUnit Unit { get; set; } = null!;
}
