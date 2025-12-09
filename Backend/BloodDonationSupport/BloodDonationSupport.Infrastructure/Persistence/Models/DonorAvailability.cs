namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class DonorAvailability
{
    public long AvailabilityId { get; set; }

    public long DonorId { get; set; }

    public byte Weekday { get; set; }

    public short TimeFromMin { get; set; }

    public short TimeToMin { get; set; }

    public virtual Donor Donor { get; set; } = null!;
}