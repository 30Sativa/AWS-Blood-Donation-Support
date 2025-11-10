using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class BloodTypeConfiguration : IEntityTypeConfiguration<BloodType>
    {
        public void Configure(EntityTypeBuilder<BloodType> builder)
        {
            builder.ToTable("blood_types", t =>
            {
                t.HasCheckConstraint("CK_blood_types_abo", "[abo] IN ('O', 'A', 'B', 'AB')");
                t.HasCheckConstraint("CK_blood_types_rh", "[rh] IN ('+', '-')");
            });

            builder.HasKey(bt => bt.BloodTypeId)
                   .HasName("PK_blood_types");

            builder.Property(bt => bt.BloodTypeId)
                   .HasColumnName("blood_type_id")
                   .ValueGeneratedOnAdd();

            builder.Property(bt => bt.Abo)
                   .HasColumnName("abo")
                   .IsRequired()
                   .HasMaxLength(2);

            builder.Property(bt => bt.Rh)
                   .HasColumnName("rh")
                   .IsRequired()
                   .HasMaxLength(1);

            // Unique constraint on (abo, rh) combination
            builder.HasIndex(bt => new { bt.Abo, bt.Rh })
                   .IsUnique()
                   .HasDatabaseName("IX_blood_types_abo_rh");
        }
    }
}