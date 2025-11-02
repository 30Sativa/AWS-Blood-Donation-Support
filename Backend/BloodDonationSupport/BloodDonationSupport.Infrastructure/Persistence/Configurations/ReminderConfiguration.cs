using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
    {
        public void Configure(EntityTypeBuilder<Reminder> builder)
        {
            builder.ToTable("reminders");

            builder.HasKey(r => r.ReminderId)
                   .HasName("PK_reminders");

            builder.Property(r => r.ReminderId)
                   .HasColumnName("reminder_id")
                   .ValueGeneratedOnAdd();

            builder.Property(r => r.DonorId)
                   .HasColumnName("donor_id")
                   .IsRequired();

            builder.Property(r => r.ReminderType)
                   .HasColumnName("reminder_type")
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(r => r.TargetDate)
                   .HasColumnName("target_date")
                   .IsRequired();

            builder.Property(r => r.SentAt)
                   .HasColumnName("sent_at");

            builder.Property(r => r.IsSnoozed)
                   .HasColumnName("is_snoozed")
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(r => r.SnoozeUntil)
                   .HasColumnName("snooze_until");

            builder.Property(r => r.ProcessedBatchId)
                   .HasColumnName("processed_batch_id")
                   .HasMaxLength(50);

            builder.Property(r => r.RetryCount)
                   .HasColumnName("retry_count")
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(r => r.LastAttemptAt)
                   .HasColumnName("last_attempt_at");

            builder.Property(r => r.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            // Foreign key to Donor
            builder.HasOne(r => r.Donor)
                   .WithMany(d => d.Reminders)
                   .HasForeignKey(r => r.DonorId)
                   .HasConstraintName("FK_reminders_donors")
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes
            builder.HasIndex(r => new { r.DonorId, r.TargetDate, r.SentAt })
                   .HasDatabaseName("IX_reminders_donor_date");

            builder.HasIndex(r => new { r.SentAt, r.IsSnoozed })
                   .HasDatabaseName("IX_reminders_pending")
                   .HasFilter("[sent_at] IS NULL AND [is_snoozed] = 0");
        }
    }
}
