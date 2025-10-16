using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class RecoveryPolicy
{
    public int PolicyId { get; set; }

    public int ComponentId { get; set; }

    public int MinDays { get; set; }

    public virtual BloodComponent Component { get; set; } = null!;
}
