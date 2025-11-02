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
    public class SlaConfigConfiguration : IEntityTypeConfiguration<SlaConfig>
    {
        public void Configure(EntityTypeBuilder<SlaConfig> builder)
        {
            builder.ToTable("sla_config"); 

            builder.HasKey(s => s.SlaId).HasName("PK_sla_config");
            builder.Property(s => s.SlaId).HasColumnName("sla_id");

            builder.Property(s => s.Urgency).HasColumnName("urgency");
            builder.Property(s => s.TargetMinutes).HasColumnName("target_minutes");
            builder.Property(s => s.AlertBeforeMinutes).HasColumnName("alert_before_minutes");
        }
    }
}
