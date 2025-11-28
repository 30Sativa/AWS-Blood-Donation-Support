using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class MatchConfiguration : IEntityTypeConfiguration<Match>
    {
        public void Configure(EntityTypeBuilder<Match> builder)
        {
            builder.ToTable("matches");

            // PRIMARY KEY (identity)
            builder.HasKey(m => m.MatchId);

            builder.Property(m => m.MatchId)
                .HasColumnName("match_id")
                .ValueGeneratedOnAdd();   // 🔥 FIX CHUẨN

            // foreign keys
            builder.Property(m => m.RequestId).HasColumnName("request_id");
            builder.Property(m => m.DonorId).HasColumnName("donor_id");

            // numeric
            builder.Property(m => m.CompatibilityScore).HasColumnName("compatibility_score");
            builder.Property(m => m.DistanceKm).HasColumnName("distance_km");

            // strings
            builder.Property(m => m.Status).HasColumnName("status");
            builder.Property(m => m.Response).HasColumnName("response");

            // datetime
            builder.Property(m => m.ContactedAt).HasColumnName("contacted_at");
            builder.Property(m => m.CreatedAt).HasColumnName("created_at");

            // relationships
            builder.HasOne(m => m.Request)
                .WithMany(r => r.Matches)
                .HasForeignKey(m => m.RequestId);

            builder.HasOne(m => m.Donor)
                .WithMany(d => d.Matches)
                .HasForeignKey(m => m.DonorId);
        }
    }
}
