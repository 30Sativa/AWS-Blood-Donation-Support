namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class CompatibilityMatrix
{
    public int FromBloodTypeId { get; set; }

    public int ToBloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public bool IsCompatible { get; set; }

    public int? PriorityLevel { get; set; }

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual BloodType FromBloodType { get; set; } = null!;

    public virtual BloodType ToBloodType { get; set; } = null!;
}