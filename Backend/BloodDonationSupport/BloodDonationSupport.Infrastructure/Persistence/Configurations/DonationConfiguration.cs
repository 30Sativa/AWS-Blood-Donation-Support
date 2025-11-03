using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class DonationConfiguration : IEntityTypeConfiguration<Donation>
    {
        public void Configure(EntityTypeBuilder<Donation> builder)
        {
            builder.ToTable("donations", t => t.HasCheckConstraint("CK_donations_volume", "[volume_ml] IS NULL OR [volume_ml] > 0"));

            builder.HasKey(d => d.DonationId)
                   .HasName("PK_donations");

            builder.Property(d => d.DonationId)
                   .HasColumnName("donation_id")
                   .ValueGeneratedOnAdd();

            builder.Property(d => d.DonorId)
                   .HasColumnName("donor_id")
                   .IsRequired();

            builder.Property(d => d.AppointmentId)
                   .HasColumnName("appointment_id");

            builder.Property(d => d.ComponentType)
                   .HasColumnName("component_type")
                   .HasMaxLength(20);

            builder.Property(d => d.CollectedAt)
                   .HasColumnName("collected_at")
                   .IsRequired();

            builder.Property(d => d.VolumeMl)
                   .HasColumnName("volume_ml");

            builder.Property(d => d.UnitsDonated)
                   .HasColumnName("units_donated");

            builder.Property(d => d.Notes)
                   .HasColumnName("notes")
                   .HasMaxLength(500);

            builder.Property(d => d.CreatedBy)
                   .HasColumnName("created_by")
                   .IsRequired();

            builder.Property(d => d.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            // Foreign keys
            builder.HasOne(d => d.Donor)
                   .WithMany(d => d.Donations)
                   .HasForeignKey(d => d.DonorId)
                   .HasConstraintName("FK_donations_donors")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(d => d.Appointment)
                   .WithMany(a => a.Donations)
                   .HasForeignKey(d => d.AppointmentId)
                   .HasConstraintName("FK_donations_appointments")
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(d => d.CreatedByNavigation)
                   .WithMany(u => u.Donations)
                   .HasForeignKey(d => d.CreatedBy)
                   .HasConstraintName("FK_donations_users")
                   .OnDelete(DeleteBehavior.Restrict);

            // Index
            builder.HasIndex(d => new { d.DonorId, d.CollectedAt })
                   .HasDatabaseName("IX_donations_donor");
        }
    }
}
