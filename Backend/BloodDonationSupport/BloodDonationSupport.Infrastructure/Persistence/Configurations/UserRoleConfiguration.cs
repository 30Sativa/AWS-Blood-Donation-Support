using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            builder.ToTable("user_roles");

            builder.HasKey(ur => new { ur.UserId, ur.RoleId })
                   .HasName("PK_user_roles");

            builder.Property(ur => ur.UserId)
                   .HasColumnName("user_id")
                   .HasColumnType("bigint")
                   .IsRequired();

            builder.Property(ur => ur.RoleId)
                   .HasColumnName("role_id")
                   .HasColumnType("int")
                   .IsRequired();

            builder.HasOne(ur => ur.User)
                   .WithMany(u => u.UserRoles)
                   .HasForeignKey(ur => ur.UserId)
                   .HasConstraintName("FK_user_roles_users")
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired();

            builder.HasOne(ur => ur.Role)
                   .WithMany(r => r.UserRoles)
                   .HasForeignKey(ur => ur.RoleId)
                   .HasConstraintName("FK_user_roles_roles")
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired();
        }
    }
}
