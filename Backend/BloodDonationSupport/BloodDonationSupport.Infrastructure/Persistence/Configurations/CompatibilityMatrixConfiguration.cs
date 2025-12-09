using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class CompatibilityMatrixConfiguration : IEntityTypeConfiguration<CompatibilityMatrix>
    {
        public void Configure(EntityTypeBuilder<CompatibilityMatrix> builder)
        {
            builder.ToTable("compatibility_matrix");

            builder.HasKey(c => new { c.FromBloodTypeId, c.ToBloodTypeId, c.ComponentId });

            // Map properties to database column names (snake_case)
            builder.Property(c => c.FromBloodTypeId)
                   .HasColumnName("from_blood_type_id")
                   .IsRequired();

            builder.Property(c => c.ToBloodTypeId)
                   .HasColumnName("to_blood_type_id")
                   .IsRequired();

            builder.Property(c => c.ComponentId)
                   .HasColumnName("component_id")
                   .IsRequired();

            builder.Property(c => c.IsCompatible)
                   .HasColumnName("is_compatible")
                   .IsRequired();

            builder.Property(c => c.PriorityLevel)
                   .HasColumnName("priority_level");

            builder.HasOne(c => c.FromBloodType)
                   .WithMany(b => b.CompatibilityMatrixFromBloodTypes)
                   .HasForeignKey(c => c.FromBloodTypeId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_compatibility_matrix_from");

            builder.HasOne(c => c.ToBloodType)
                   .WithMany(b => b.CompatibilityMatrixToBloodTypes)
                   .HasForeignKey(c => c.ToBloodTypeId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_compatibility_matrix_to");

            builder.HasOne(c => c.Component)
                   .WithMany(p => p.CompatibilityMatrices)
                   .HasForeignKey(c => c.ComponentId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_compatibility_matrix_component");
        }
    }
}