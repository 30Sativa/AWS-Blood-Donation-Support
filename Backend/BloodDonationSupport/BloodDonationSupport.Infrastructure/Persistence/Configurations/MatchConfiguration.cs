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

            builder.HasKey(m => m.MatchId)
                   .HasName("PK_matches");

            builder.Property(m => m.MatchId).HasColumnName("match_id");

            builder.HasOne(m => m.Request)
                   .WithMany(r => r.Matches)
                   .HasForeignKey(m => m.RequestId);

            builder.HasOne(m => m.Donor)
                   .WithMany(d => d.Matches)
                   .HasForeignKey(m => m.DonorId);
        }
    }
}