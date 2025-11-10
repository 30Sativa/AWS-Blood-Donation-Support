using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
    {
        public void Configure(EntityTypeBuilder<UserProfile> builder)
        {
            builder.ToTable("user_profiles");

            builder.HasKey(up => up.UserId)
                   .HasName("PK_user_profiles");

            builder.Property(up => up.UserId)
                   .HasColumnName("user_id");

            builder.Property(up => up.FullName)
                   .HasColumnName("full_name")
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(up => up.Gender)
                   .HasColumnName("gender")
                   .HasMaxLength(20);

            builder.Property(up => up.BirthYear)
                   .HasColumnName("birth_year");

            builder.Property(up => up.PrivacyPhoneVisibleToStaffOnly)
                   .HasColumnName("privacy_phone_visible_to_staff_only")
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(up => up.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(up => up.UpdatedAt)
                   .HasColumnName("updated_at");

            // 1-1 relationship with User (UserId is both PK and FK)
            builder.HasOne(up => up.User)
                   .WithOne(u => u.UserProfile)
                   .HasForeignKey<UserProfile>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}