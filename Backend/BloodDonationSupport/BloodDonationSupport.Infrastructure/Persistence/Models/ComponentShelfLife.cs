using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class ComponentShelfLife
{
    public int ShelfId { get; set; }

    public int ComponentId { get; set; }

    public int ShelfDays { get; set; }

    public virtual BloodComponent Component { get; set; } = null!;
}
