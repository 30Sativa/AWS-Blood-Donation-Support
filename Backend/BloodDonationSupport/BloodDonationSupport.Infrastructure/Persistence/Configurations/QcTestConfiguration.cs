using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class QcTestConfiguration : IEntityTypeConfiguration<QcTest>
    {
        public void Configure(EntityTypeBuilder<QcTest> builder)
        {
            builder.ToTable("qc_tests");

            builder.HasKey(q => q.QcId)
                   .HasName("PK_qc_tests");

            builder.Property(q => q.QcId)
                   .HasColumnName("qc_id")
                   .ValueGeneratedOnAdd();

            builder.Property(q => q.UnitId)
                   .HasColumnName("unit_id")
                   .IsRequired();

            builder.Property(q => q.QcStatus)
                   .HasColumnName("qc_status")
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("PENDING");

            builder.HasCheckConstraint("CK_qc_tests_qc_status", "[qc_status] IN ('PENDING', 'PASSED', 'FAILED')");

            builder.Property(q => q.ResultsJson)
                   .HasColumnName("results_json")
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(q => q.TestedAt)
                   .HasColumnName("tested_at");

            builder.Property(q => q.TestedBy)
                   .HasColumnName("tested_by");

            builder.Property(q => q.Notes)
                   .HasColumnName("notes")
                   .HasMaxLength(500);

            // Foreign keys
            builder.HasOne(q => q.Unit)
                   .WithMany()
                   .HasForeignKey(q => q.UnitId)
                   .HasConstraintName("FK_qc_tests_inventory_units")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(q => q.TestedByNavigation)
                   .WithMany()
                   .HasForeignKey(q => q.TestedBy)
                   .HasConstraintName("FK_qc_tests_users")
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

