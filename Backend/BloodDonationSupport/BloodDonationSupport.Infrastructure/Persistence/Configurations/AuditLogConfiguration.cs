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
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("audit_logs");

            //Khóa chính
            builder.HasKey(a => a.AuditId)
                   .HasName("PK_audit_logs");

            builder.Property(a => a.AuditId)
                   .HasColumnName("audit_id");

            builder.Property(a => a.Action)
                   .HasMaxLength(100)
                   .HasColumnName("action");

            builder.Property(a => a.EntityType)
                   .HasMaxLength(100)
                   .HasColumnName("entity_type");

            builder.Property(a => a.EntityId)
                   .HasMaxLength(100)
                   .HasColumnName("entity_id");

            builder.Property(a => a.DetailsJson)
                   .HasColumnName("details_json");

            builder.Property(a => a.IpAddress)
                   .HasMaxLength(50)
                   .HasColumnName("ip_address");

            builder.Property(a => a.NewValue)
                   .HasColumnName("new_value");

            builder.Property(a => a.OldValue)
                   .HasColumnName("old_value");

            builder.Property(a => a.CreatedAt)
                   .HasDefaultValueSql("(sysutcdatetime())")
                   .HasColumnName("created_at");

            builder.Property(a => a.UserId)
                   .HasColumnName("user_id");
        }
    }
}
