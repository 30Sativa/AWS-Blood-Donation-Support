using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class SlaConfig
{
    public int SlaId { get; set; }

    public string Urgency { get; set; } = null!;

    public int TargetMinutes { get; set; }

    public int AlertBeforeMinutes { get; set; }
}
