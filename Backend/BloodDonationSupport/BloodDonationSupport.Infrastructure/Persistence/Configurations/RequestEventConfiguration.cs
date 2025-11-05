using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class RequestEventConfiguration : IEntityTypeConfiguration<RequestEvent>
    {
        public void Configure(EntityTypeBuilder<RequestEvent> builder)
        {
            builder.ToTable("request_events");

            builder.HasKey(e => e.EventId)
                   .HasName("PK_request_events");

            builder.Property(e => e.EventId).HasColumnName("event_id");

            builder.HasOne(e => e.Request)
                   .WithMany(r => r.RequestEvents)
                   .HasForeignKey(e => e.RequestId);
        }
    }
}