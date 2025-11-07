namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class InventoryUnit
{
    public long UnitId { get; set; }

    public long? DonationId { get; set; }

    public string UnitCode { get; set; } = null!;

    public int BloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public int VolumeMl { get; set; }

    public DateTime CollectedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public string? StoragePlace { get; set; }

    public string Status { get; set; } = null!;

    public long? ReservedForRequestId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual BloodType BloodType { get; set; } = null!;

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual Donation? Donation { get; set; }

    public virtual ICollection<QcTest> QcTests { get; set; } = new List<QcTest>();

    public virtual Request? ReservedForRequest { get; set; }
}