using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class DonationAttemptConfiguration : IEntityTypeConfiguration<DonationAttempt>
    {
        public void Configure(EntityTypeBuilder<DonationAttempt> builder)
        {
            builder.ToTable("donation_attempts", t => t.HasCheckConstraint("CK_donation_attempts_status", "[status] IN ('COMPLETED', 'FAILED', 'NO_SHOW', 'CANCELLED')"));

            builder.HasKey(d => d.AttemptId)
                   .HasName("PK_donation_attempts");

            builder.Property(d => d.AttemptId)
                   .HasColumnName("attempt_id")
                   .ValueGeneratedOnAdd();

            builder.Property(d => d.AppointmentId)
                   .HasColumnName("appointment_id")
                   .IsRequired();

            builder.Property(d => d.Status)
                   .HasColumnName("status")
                   .IsRequired()
                   .HasMaxLength(30)
                   .HasDefaultValue("COMPLETED");

            builder.Property(d => d.Reason)
                   .HasColumnName("reason")
                   .HasMaxLength(500);

            builder.Property(d => d.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            // Foreign key to Appointment
            builder.HasOne(d => d.Appointment)
                   .WithMany(a => a.DonationAttempts)
                   .HasForeignKey(d => d.AppointmentId)
                   .HasConstraintName("FK_donation_attempts_appointments")
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}