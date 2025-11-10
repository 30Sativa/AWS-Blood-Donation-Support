namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class HealthCondition
{
    public int ConditionId { get; set; }

    public string ConditionCode { get; set; } = null!;

    public string ConditionName { get; set; } = null!;

    public bool IsDonationEligible { get; set; }

    public virtual ICollection<DonorHealthCondition> DonorHealthConditions { get; set; } = new List<DonorHealthCondition>();
}