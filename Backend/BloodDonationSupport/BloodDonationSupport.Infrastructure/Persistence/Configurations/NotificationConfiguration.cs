using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("notifications");

            builder.HasKey(n => n.NotificationId)
                   .HasName("PK_notifications");

            builder.Property(n => n.NotificationId)
                   .HasColumnName("notification_id")
                   .ValueGeneratedOnAdd();

            builder.Property(n => n.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(n => n.Channel)
                   .HasColumnName("channel")
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("EMAIL");

            builder.HasCheckConstraint("CK_notifications_channel", "[channel] IN ('PUSH', 'SMS', 'EMAIL')");

            builder.Property(n => n.TemplateCode)
                   .HasColumnName("template_code")
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(n => n.PayloadJson)
                   .HasColumnName("payload_json")
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(n => n.Status)
                   .HasColumnName("status")
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("QUEUED");

            builder.HasCheckConstraint("CK_notifications_status", "[status] IN ('QUEUED', 'SENT', 'FAILED', 'DELIVERED')");

            builder.Property(n => n.AwsMessageId)
                   .HasColumnName("aws_message_id")
                   .HasMaxLength(100);

            builder.Property(n => n.DeliveryStatus)
                   .HasColumnName("delivery_status")
                   .HasMaxLength(20);

            builder.Property(n => n.ErrorMessage)
                   .HasColumnName("error_message")
                   .HasMaxLength(500);

            builder.Property(n => n.OpenedAt)
                   .HasColumnName("opened_at");

            builder.Property(n => n.ClickedAt)
                   .HasColumnName("clicked_at");

            builder.Property(n => n.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(n => n.SentAt)
                   .HasColumnName("sent_at");

            // Foreign key
            builder.HasOne(n => n.User)
                   .WithMany(u => u.Notifications)
                   .HasForeignKey(n => n.UserId)
                   .HasConstraintName("FK_notifications_users")
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(n => new { n.UserId, n.Status })
                   .HasDatabaseName("IX_notifications_user_status");

            builder.HasIndex(n => n.AwsMessageId)
                   .HasDatabaseName("IX_notifications_aws_msg");
        }
    }
}
