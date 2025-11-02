using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class RequestConfiguration : IEntityTypeConfiguration<Request>
    {
        public void Configure(EntityTypeBuilder<Request> builder)
        {
            builder.ToTable("requests");

            builder.HasKey(r => r.RequestId)
                   .HasName("PK_requests");

            builder.Property(r => r.RequestId)
                   .HasColumnName("request_id")
                   .ValueGeneratedOnAdd();

            builder.Property(r => r.RequesterUserId)
                   .HasColumnName("requester_user_id")
                   .IsRequired();

            builder.Property(r => r.Urgency)
                   .HasColumnName("urgency")
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("NORMAL");

            builder.HasCheckConstraint("CK_requests_urgency", "[urgency] IN ('LOW', 'NORMAL', 'HIGH')");

            builder.Property(r => r.BloodTypeId)
                   .HasColumnName("blood_type_id")
                   .IsRequired();

            builder.Property(r => r.ComponentId)
                   .HasColumnName("component_id")
                   .IsRequired();

            builder.Property(r => r.QuantityUnits)
                   .HasColumnName("quantity_units")
                   .IsRequired();

            builder.HasCheckConstraint("CK_requests_quantity", "[quantity_units] > 0");

            builder.Property(r => r.NeedBeforeUtc)
                   .HasColumnName("need_before_utc");

            builder.Property(r => r.DeliveryAddressId)
                   .HasColumnName("delivery_address_id");

            builder.Property(r => r.Status)
                   .HasColumnName("status")
                   .IsRequired()
                   .HasMaxLength(40)
                   .HasDefaultValue("REQUESTED");

            builder.Property(r => r.ClinicalNotes)
                   .HasColumnName("clinical_notes")
                   .HasMaxLength(1000);

            builder.Property(r => r.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(r => r.UpdatedAt)
                   .HasColumnName("updated_at");

            // Foreign keys
            builder.HasOne(r => r.RequesterUser)
                   .WithMany(u => u.Requests)
                   .HasForeignKey(r => r.RequesterUserId)
                   .HasConstraintName("FK_requests_users")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.BloodType)
                   .WithMany(bt => bt.Requests)
                   .HasForeignKey(r => r.BloodTypeId)
                   .HasConstraintName("FK_requests_blood_types");

            builder.HasOne(r => r.Component)
                   .WithMany(c => c.Requests)
                   .HasForeignKey(r => r.ComponentId)
                   .HasConstraintName("FK_requests_blood_components");

            builder.HasOne(r => r.DeliveryAddress)
                   .WithMany()
                   .HasForeignKey(r => r.DeliveryAddressId)
                   .HasConstraintName("FK_requests_addresses")
                   .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(r => r.Status)
                   .HasDatabaseName("IX_requests_status");

            builder.HasIndex(r => r.NeedBeforeUtc)
                   .HasDatabaseName("IX_requests_deadline");

            builder.HasIndex(r => new { r.Urgency, r.CreatedAt })
                   .HasDatabaseName("IX_requests_urgency_created");
        }
    }
}
