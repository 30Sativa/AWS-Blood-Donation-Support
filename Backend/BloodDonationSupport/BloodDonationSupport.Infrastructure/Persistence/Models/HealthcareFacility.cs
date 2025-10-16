using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class HealthcareFacility
{
    public long FacilityId { get; set; }

    public string FacilityName { get; set; } = null!;

    public long AddressId { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Address Address { get; set; } = null!;
}
