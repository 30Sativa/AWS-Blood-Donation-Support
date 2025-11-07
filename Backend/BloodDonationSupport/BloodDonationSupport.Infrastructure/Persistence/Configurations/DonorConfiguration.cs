using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class DonorConfiguration : IEntityTypeConfiguration<Donor>
    {
        public void Configure(EntityTypeBuilder<Donor> builder)
        {
            builder.ToTable("donors");

            builder.HasKey(d => d.DonorId)
                   .HasName("PK_donors");

            builder.Property(d => d.DonorId)
                   .HasColumnName("donor_id")
                   .ValueGeneratedOnAdd();

            builder.Property(d => d.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.HasIndex(d => d.UserId)
                   .IsUnique()
                   .HasDatabaseName("IX_donors_user_id");

            builder.Property(d => d.BloodTypeId)
                   .HasColumnName("blood_type_id");

            builder.Property(d => d.AddressId)
                   .HasColumnName("address_id");

            builder.Property(d => d.TravelRadiusKm)
                   .HasColumnName("travel_radius_km")
                   .IsRequired()
                   .HasColumnType("DECIMAL(5,2)")
                   .HasDefaultValue(10m);

            builder.Property(d => d.NextEligibleDate)
                   .HasColumnName("next_eligible_date")
                   .HasColumnType("DATE");

            builder.Property(d => d.IsReady)
                   .HasColumnName("is_ready")
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(d => d.LocationUpdatedAt)
                   .HasColumnName("location_updated_at");

            builder.Property(d => d.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(d => d.UpdatedAt)
                   .HasColumnName("updated_at");

            // Foreign keys
            builder.HasOne(d => d.User)
                   .WithOne(u => u.Donor)
                   .HasForeignKey<Donor>(d => d.UserId)
                   .HasConstraintName("FK_donors_users")
                   .OnDelete(DeleteBehavior.ClientSetNull);

            builder.HasOne(d => d.BloodType)
                   .WithMany(bt => bt.Donors)
                   .HasForeignKey(d => d.BloodTypeId)
                   .HasConstraintName("FK_donors_blood_types")
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(d => d.Address)
                   .WithMany(a => a.Donors)
                   .HasForeignKey(d => d.AddressId)
                   .HasConstraintName("FK_donors_addresses")
                   .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(d => new { d.BloodTypeId, d.IsReady })
                   .HasDatabaseName("IX_donors_blood_ready");
        }
    }
}
