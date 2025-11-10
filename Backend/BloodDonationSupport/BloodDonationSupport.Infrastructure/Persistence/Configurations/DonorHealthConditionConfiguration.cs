using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class DonorHealthConditionConfiguration : IEntityTypeConfiguration<DonorHealthCondition>
    {
        public void Configure(EntityTypeBuilder<DonorHealthCondition> builder)
        {
            builder.ToTable("donor_health_conditions");

            builder.HasKey(dh => new { dh.DonorId, dh.ConditionId })
                   .HasName("PK_donor_health_conditions");

            builder.Property(dh => dh.DonorId)
                   .HasColumnName("donor_id");

            builder.Property(dh => dh.ConditionId)
                   .HasColumnName("condition_id");

            builder.HasOne(dh => dh.Donor)
                   .WithMany(d => d.DonorHealthConditions)
                   .HasForeignKey(dh => dh.DonorId)
                   .HasConstraintName("FK_dhc_donors")
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(dh => dh.Condition)
                   .WithMany(c => c.DonorHealthConditions)
                   .HasForeignKey(dh => dh.ConditionId)
                   .HasConstraintName("FK_donor_health_conditions_health_conditions");
        }
    }
}