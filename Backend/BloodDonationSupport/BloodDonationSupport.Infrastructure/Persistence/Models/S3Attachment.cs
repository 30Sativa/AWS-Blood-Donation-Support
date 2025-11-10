namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class S3Attachment
{
    public long AttachmentId { get; set; }

    public string EntityType { get; set; } = null!;

    public long EntityId { get; set; }

    public string S3Bucket { get; set; } = null!;

    public string S3Key { get; set; } = null!;

    public string FileName { get; set; } = null!;

    public long? FileSize { get; set; }

    public string? MimeType { get; set; }

    public long UploadedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User UploadedByNavigation { get; set; } = null!;
}