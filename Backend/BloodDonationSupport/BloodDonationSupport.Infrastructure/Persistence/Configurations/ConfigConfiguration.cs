using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class ConfigConfiguration : IEntityTypeConfiguration<Config>
    {
        public void Configure(EntityTypeBuilder<Config> builder)
        {
            builder.ToTable("configs");

            builder.HasKey(c => c.ConfigKey).HasName("PK_configs");
            builder.Property(c => c.ConfigKey).HasColumnName("config_key");
            builder.Property(c => c.ConfigValue).HasColumnName("config_value");
            builder.Property(c => c.ConfigType)
                   .HasDefaultValue("STRING")
                   .HasColumnName("config_type");
            builder.Property(c => c.Description).HasColumnName("description");
            builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");
            builder.Property(c => c.UpdatedBy).HasColumnName("updated_by");
        }
    }
}