using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class ComponentShelfLifeConfiguration : IEntityTypeConfiguration<ComponentShelfLife>
    {
        public void Configure(EntityTypeBuilder<ComponentShelfLife> builder)
        {
            builder.ToTable("component_shelf_life");

            builder.HasKey(s => s.ShelfId).HasName("PK_component_shelf_life");
            builder.Property(s => s.ShelfId).HasColumnName("shelf_id");
            builder.Property(s => s.ComponentId).HasColumnName("component_id");
            builder.Property(s => s.ShelfDays).HasColumnName("shelf_days");

            builder.HasOne(s => s.Component)
                   .WithOne(c => c.ComponentShelfLife)
                   .HasForeignKey<ComponentShelfLife>(s => s.ComponentId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_component_shelf_life_component");
        }
    }
}