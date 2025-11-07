namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Match
{
    public long MatchId { get; set; }

    public long RequestId { get; set; }

    public long DonorId { get; set; }

    public decimal? CompatibilityScore { get; set; }

    public decimal DistanceKm { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? ContactedAt { get; set; }

    public string? Response { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Donor Donor { get; set; } = null!;

    public virtual Request Request { get; set; } = null!;
}