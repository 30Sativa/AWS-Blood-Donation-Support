using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.ToTable("addresses");

            builder.HasKey(a => a.AddressId)
                   .HasName("PK_addresses");

            builder.Property(a => a.AddressId)
                   .HasColumnName("address_id")
                   .ValueGeneratedOnAdd();

            builder.Property(a => a.Line1)
                   .HasColumnName("line1")
                   .HasMaxLength(255);

            builder.Property(a => a.District)
                   .HasColumnName("district")
                   .HasMaxLength(100);

            builder.Property(a => a.City)
                   .HasColumnName("city")
                   .HasMaxLength(100);

            builder.Property(a => a.Province)
                   .HasColumnName("province")
                   .HasMaxLength(100);

            builder.Property(a => a.Country)
                   .HasColumnName("country")
                   .HasMaxLength(100)
                   .HasDefaultValue("Vietnam");

            builder.Property(a => a.PostalCode)
                   .HasColumnName("postal_code")
                   .HasMaxLength(20);

            builder.Property(a => a.NormalizedAddress)
                   .HasColumnName("normalized_address")
                   .HasMaxLength(500);

            builder.Property(a => a.PlaceId)
                   .HasColumnName("place_id")
                   .HasMaxLength(100);

            builder.Property(a => a.ConfidenceScore)
                   .HasColumnName("confidence_score")
                   .HasColumnType("DECIMAL(3,2)");

            // Note: Location (GEOGRAPHY) column would need special handling
            // This would typically require a custom value converter or raw SQL
        }
    }
}