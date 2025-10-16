using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Config
{
    public string ConfigKey { get; set; } = null!;

    public string ConfigValue { get; set; } = null!;

    public string ConfigType { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime UpdatedAt { get; set; }

    public long? UpdatedBy { get; set; }
}
