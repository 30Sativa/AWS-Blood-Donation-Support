using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.ToTable("appointments", t =>
                t.HasCheckConstraint("CK_appointments_status", "[status] IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')"));

            builder.HasKey(a => a.AppointmentId)
                   .HasName("PK_appointments");

            builder.Property(a => a.AppointmentId)
                   .HasColumnName("appointment_id")
                   .ValueGeneratedOnAdd();

            builder.Property(a => a.RequestId)
                   .HasColumnName("request_id")
                   .IsRequired();

            builder.Property(a => a.DonorId)
                   .HasColumnName("donor_id")
                   .IsRequired();

            builder.Property(a => a.ScheduledAt)
                   .HasColumnName("scheduled_at")
                   .IsRequired();

            builder.Property(a => a.LocationId)
                   .HasColumnName("location_id");

            builder.Property(a => a.Status)
                   .HasColumnName("status")
                   .IsRequired()
                   .HasMaxLength(30)
                   .HasDefaultValue("SCHEDULED");

            builder.Property(a => a.CreatedBy)
                   .HasColumnName("created_by")
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(a => a.Notes)
                   .HasColumnName("notes");

            // Relationships
            builder.HasOne(a => a.Request)
                   .WithMany(r => r.Appointments)
                   .HasForeignKey(a => a.RequestId)
                   .HasConstraintName("FK_appointments_requests")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Donor)
                   .WithMany(d => d.Appointments)
                   .HasForeignKey(a => a.DonorId)
                   .HasConstraintName("FK_appointments_donors")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Location)
                   .WithMany()
                   .HasForeignKey(a => a.LocationId)
                   .HasConstraintName("FK_appointments_addresses")
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.CreatedByNavigation)
                   .WithMany()
                   .HasForeignKey(a => a.CreatedBy)
                   .HasConstraintName("FK_appointments_users")
                   .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(a => a.RequestId).HasDatabaseName("IX_appointments_req");
            builder.HasIndex(a => a.DonorId).HasDatabaseName("IX_appointments_donor");
            builder.HasIndex(a => new { a.ScheduledAt, a.Status }).HasDatabaseName("IX_appointments_scheduled");

            // CHỈ CẦN 2 DÒNG NÀY LÀ ĐỦ – KHÔNG THÊM GÌ NỮA!
            builder.Ignore("AddressId");
            builder.Ignore("UserId");
        }
    }
}