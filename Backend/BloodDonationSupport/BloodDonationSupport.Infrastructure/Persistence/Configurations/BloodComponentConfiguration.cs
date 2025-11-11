using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class BloodComponentConfiguration : IEntityTypeConfiguration<BloodComponent>
    {
        public void Configure(EntityTypeBuilder<BloodComponent> builder)
        {
            builder.ToTable("blood_components");

            builder.HasKey(bc => bc.ComponentId)
                   .HasName("PK_blood_components");

            builder.Property(bc => bc.ComponentId)
                   .HasColumnName("component_id")
                   .ValueGeneratedOnAdd();

            builder.Property(bc => bc.ComponentCode)
                   .HasColumnName("component_code")
                   .IsRequired()
                   .HasMaxLength(20);

            builder.HasIndex(bc => bc.ComponentCode)
                   .IsUnique()
                   .HasDatabaseName("IX_blood_components_component_code");

            builder.Property(bc => bc.ComponentName)
                   .HasColumnName("component_name")
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(bc => bc.Description)
                   .HasColumnName("description")
                   .HasMaxLength(500);

            // ✅ Quan hệ 1-1 với ComponentShelfLife
            builder.HasOne(bc => bc.ComponentShelfLife)
                   .WithOne(csl => csl.Component)
                   .HasForeignKey<ComponentShelfLife>(csl => csl.ComponentId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_component_shelf_life_component");

            // ✅ Quan hệ 1-1 với RecoveryPolicy
            builder.HasOne(bc => bc.RecoveryPolicy)
                   .WithOne(rp => rp.Component)
                   .HasForeignKey<RecoveryPolicy>(rp => rp.ComponentId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_recovery_policy_component");
        }
    }
}
