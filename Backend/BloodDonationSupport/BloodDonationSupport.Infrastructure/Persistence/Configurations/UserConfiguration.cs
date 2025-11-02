using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");

            builder.HasKey(u => u.UserId)
                   .HasName("PK_users");

            builder.Property(u => u.UserId)
                   .HasColumnName("user_id")
                   .ValueGeneratedOnAdd();

            builder.Property(u => u.Email)
                   .HasColumnName("email")
                   .IsRequired()
                   .HasMaxLength(255);

            builder.HasIndex(u => u.Email)
                   .IsUnique()
                   .HasDatabaseName("IX_users_email");

            builder.Property(u => u.PhoneNumber)
                   .HasColumnName("phone_number")
                   .HasMaxLength(30);

            builder.Property(u => u.PasswordHash)
                   .HasColumnName("password_hash")
                   .HasMaxLength(256);

            builder.Property(u => u.IsActive)
                   .HasColumnName("is_active")
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Property(u => u.CognitoUserId)
                   .HasColumnName("cognito_user_id")
                   .HasMaxLength(100);

            // Unique index for CognitoUserId where it's not null
            builder.HasIndex(u => u.CognitoUserId)
                   .IsUnique()
                   .HasDatabaseName("IX_users_cognito_id")
                   .HasFilter("[cognito_user_id] IS NOT NULL");

            builder.Property(u => u.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(u => u.UpdatedAt)
                   .HasColumnName("updated_at");

            // 1-1 relationship with UserProfile
            builder.HasOne(u => u.UserProfile)
                   .WithOne(up => up.User)
                   .HasForeignKey<UserProfile>(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // 1-1 relationship with Donor
            builder.HasOne(u => u.Donor)
                   .WithOne(d => d.User)
                   .HasForeignKey<Donor>(d => d.UserId)
                   .OnDelete(DeleteBehavior.ClientSetNull);

            // Many-to-many relationship through UserRole join entity
            // Ignore the direct Roles collection to prevent EF from creating "RoleUser" table
            builder.Ignore(u => u.Roles);
        }
    }
}
