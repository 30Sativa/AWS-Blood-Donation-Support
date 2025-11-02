using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("roles");

            builder.HasKey(r => r.RoleId)
                   .HasName("PK_roles");

            builder.Property(r => r.RoleId)
                   .HasColumnName("role_id")
                   .HasColumnType("int")
                   .ValueGeneratedOnAdd();

            builder.Property(r => r.RoleCode)
                   .HasColumnName("role_code")
                   .IsRequired()
                   .HasMaxLength(50);

            builder.HasIndex(r => r.RoleCode)
                   .IsUnique()
                   .HasDatabaseName("IX_roles_role_code");

            builder.Property(r => r.RoleName)
                   .HasColumnName("role_name")
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(r => r.Description)
                   .HasColumnName("description")
                   .HasMaxLength(500);

            // Many-to-many relationship through UserRole join entity
            // Ignore the direct Users collection to prevent EF from creating "RoleUser" table
            builder.Ignore(r => r.Users);
        }
    }
}
