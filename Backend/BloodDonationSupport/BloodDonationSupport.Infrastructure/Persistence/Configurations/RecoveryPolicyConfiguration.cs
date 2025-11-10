using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class RecoveryPolicyConfiguration : IEntityTypeConfiguration<RecoveryPolicy>
    {
        public void Configure(EntityTypeBuilder<RecoveryPolicy> builder)
        {
            builder.ToTable("recovery_policy");

            builder.HasKey(p => p.PolicyId).HasName("PK_recovery_policy");
            builder.Property(p => p.PolicyId).HasColumnName("policy_id");
            builder.Property(p => p.ComponentId).HasColumnName("component_id");
            builder.Property(p => p.MinDays).HasColumnName("min_days");

            builder.HasOne(p => p.Component)
                   .WithOne(c => c.RecoveryPolicy)
                   .HasForeignKey<RecoveryPolicy>(p => p.ComponentId)
                   .OnDelete(DeleteBehavior.ClientSetNull)
                   .HasConstraintName("FK_recovery_policy_component");
        }
    }
}