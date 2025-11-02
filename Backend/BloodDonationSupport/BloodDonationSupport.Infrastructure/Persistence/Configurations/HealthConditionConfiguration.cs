using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class HealthConditionConfiguration : IEntityTypeConfiguration<HealthCondition>
    {
        public void Configure(EntityTypeBuilder<HealthCondition> builder)
        {
            builder.ToTable("health_conditions");

            builder.HasKey(h => h.ConditionId)
                   .HasName("PK_health_conditions");

            builder.Property(h => h.ConditionId)
                   .HasColumnName("condition_id")
                   .ValueGeneratedOnAdd();

            builder.Property(h => h.ConditionCode)
                   .HasColumnName("condition_code")
                   .IsRequired()
                   .HasMaxLength(50);

            builder.HasIndex(h => h.ConditionCode)
                   .IsUnique()
                   .HasDatabaseName("IX_health_conditions_condition_code");

            builder.Property(h => h.ConditionName)
                   .HasColumnName("condition_name")
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(h => h.IsDonationEligible)
                   .HasColumnName("is_donation_eligible")
                   .IsRequired()
                   .HasDefaultValue(false);
        }
    }
}
