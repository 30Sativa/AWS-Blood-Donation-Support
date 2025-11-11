using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class CompatibilityMatrixConfiguration : IEntityTypeConfiguration<CompatibilityMatrix>
    {
        public void Configure(EntityTypeBuilder<CompatibilityMatrix> builder)
        {
            builder.ToTable("compatibility_matrix");

            builder.HasKey(c => new { c.FromBloodTypeId, c.ToBloodTypeId, c.ComponentId });

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
