namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class UserProfile
{
    public long UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Gender { get; set; }

    public int? BirthYear { get; set; }

    public bool PrivacyPhoneVisibleToStaffOnly { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}