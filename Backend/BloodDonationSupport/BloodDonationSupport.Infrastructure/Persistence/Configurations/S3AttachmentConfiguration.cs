using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class S3AttachmentConfiguration : IEntityTypeConfiguration<S3Attachment>
    {
        public void Configure(EntityTypeBuilder<S3Attachment> builder)
        {
            builder.ToTable("s3_attachments");

            builder.HasKey(s => s.AttachmentId)
                   .HasName("PK_s3_attachments");

            builder.Property(s => s.AttachmentId)
                   .HasColumnName("attachment_id")
                   .ValueGeneratedOnAdd();

            builder.Property(s => s.EntityType)
                   .HasColumnName("entity_type")
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(s => s.EntityId)
                   .HasColumnName("entity_id")
                   .IsRequired();

            builder.Property(s => s.S3Bucket)
                   .HasColumnName("s3_bucket")
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(s => s.S3Key)
                   .HasColumnName("s3_key")
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(s => s.FileName)
                   .HasColumnName("file_name")
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(s => s.FileSize)
                   .HasColumnName("file_size");

            builder.Property(s => s.MimeType)
                   .HasColumnName("mime_type")
                   .HasMaxLength(100);

            builder.Property(s => s.UploadedBy)
                   .HasColumnName("uploaded_by")
                   .IsRequired();

            builder.Property(s => s.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            // Foreign key
            builder.HasOne(s => s.UploadedByNavigation)
                   .WithMany()
                   .HasForeignKey(s => s.UploadedBy)
                   .HasConstraintName("FK_s3_attachments_users")
                   .OnDelete(DeleteBehavior.Restrict);

            // Index
            builder.HasIndex(s => new { s.EntityType, s.EntityId })
                   .HasDatabaseName("IX_attachments_entity");
        }
    }
}