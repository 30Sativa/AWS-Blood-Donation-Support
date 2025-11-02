using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class DonorAvailabilityConfiguration : IEntityTypeConfiguration<DonorAvailability>
    {
        public void Configure(EntityTypeBuilder<DonorAvailability> builder)
        {
            builder.ToTable("donor_availability");

            builder.HasKey(a => a.AvailabilityId)
                   .HasName("PK_donor_availability");

            builder.Property(a => a.AvailabilityId)
                   .HasColumnName("availability_id")
                   .ValueGeneratedOnAdd();

            builder.Property(a => a.DonorId)
                   .HasColumnName("donor_id")
                   .IsRequired();

            builder.Property(a => a.Weekday)
                   .HasColumnName("weekday")
                   .IsRequired();

            builder.HasCheckConstraint("CK_donor_availability_weekday", "[weekday] BETWEEN 0 AND 6");

            builder.Property(a => a.TimeFromMin)
                   .HasColumnName("time_from_min")
                   .IsRequired();

            builder.HasCheckConstraint("CK_donor_availability_time_from", "[time_from_min] BETWEEN 0 AND 1440");

            builder.Property(a => a.TimeToMin)
                   .HasColumnName("time_to_min")
                   .IsRequired();

            builder.HasCheckConstraint("CK_donor_availability_time_to", "[time_to_min] BETWEEN 0 AND 1440");

            builder.HasOne(a => a.Donor)
                   .WithMany(d => d.DonorAvailabilities)
                   .HasForeignKey(a => a.DonorId)
                   .HasConstraintName("FK_donor_availability_donors")
                   .OnDelete(DeleteBehavior.Cascade);

            // Index
            builder.HasIndex(a => a.DonorId)
                   .HasDatabaseName("IX_donor_availability_donor");
        }
    }
}
