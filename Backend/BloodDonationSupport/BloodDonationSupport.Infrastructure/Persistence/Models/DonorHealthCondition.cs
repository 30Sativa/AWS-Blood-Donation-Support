using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class DonorHealthCondition
{
    public long DonorId { get; set; }

    public int ConditionId { get; set; }

    public virtual HealthCondition Condition { get; set; } = null!;
}
