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
    public class HealthcareFacilityConfiguration : IEntityTypeConfiguration<HealthcareFacility>
    {
        public void Configure(EntityTypeBuilder<HealthcareFacility> builder)
        {
            builder.ToTable("healthcare_facilities");

            builder.HasKey(h => h.FacilityId).HasName("PK_healthcare_facilities");
            builder.Property(h => h.FacilityId).HasColumnName("facility_id");

            builder.HasOne(h => h.Address)
                   .WithMany(a => a.HealthcareFacilities)
                   .HasForeignKey(h => h.AddressId);
        }
    }
}
