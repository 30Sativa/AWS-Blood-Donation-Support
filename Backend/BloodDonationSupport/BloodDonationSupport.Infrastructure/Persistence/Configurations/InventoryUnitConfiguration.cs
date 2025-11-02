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
    public class InventoryUnitConfiguration : IEntityTypeConfiguration<InventoryUnit>
    {
        public void Configure(EntityTypeBuilder<InventoryUnit> builder)
        {
            builder.ToTable("inventory_units");

            builder.HasKey(i => i.UnitId).HasName("PK_inventory_units");
            builder.Property(i => i.UnitId).HasColumnName("unit_id");

            builder.Property(i => i.BloodTypeId).HasColumnName("blood_type_id");
            builder.Property(i => i.ComponentId).HasColumnName("component_id");

            builder.HasOne(i => i.BloodType)
                   .WithMany(bt => bt.InventoryUnits)
                   .HasForeignKey(i => i.BloodTypeId);

            builder.HasOne(i => i.Component)
                   .WithMany(c => c.InventoryUnits)
                   .HasForeignKey(i => i.ComponentId);
        }
    }
}
