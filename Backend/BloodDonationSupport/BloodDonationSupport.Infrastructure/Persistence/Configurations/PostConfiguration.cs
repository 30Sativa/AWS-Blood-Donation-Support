using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            builder.ToTable("posts");

            builder.HasKey(p => p.PostId)
                   .HasName("PK_posts");

            builder.Property(p => p.PostId)
                   .HasColumnName("post_id")
                   .ValueGeneratedOnAdd();

            builder.Property(p => p.Title)
                   .HasColumnName("title")
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(p => p.Slug)
                   .HasColumnName("slug")
                   .IsRequired()
                   .HasMaxLength(500);

            builder.HasIndex(p => p.Slug)
                   .IsUnique()
                   .HasDatabaseName("IX_posts_slug");

            builder.Property(p => p.Content)
                   .HasColumnName("content")
                   .IsRequired()
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(p => p.Excerpt)
                   .HasColumnName("excerpt")
                   .HasMaxLength(1000);

            builder.Property(p => p.AuthorId)
                   .HasColumnName("author_id")
                   .IsRequired();

            builder.Property(p => p.PublishedAt)
                   .HasColumnName("published_at");

            builder.Property(p => p.IsPublished)
                   .HasColumnName("is_published")
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(p => p.CreatedAt)
                   .HasColumnName("created_at")
                   .IsRequired()
                   .HasDefaultValueSql("SYSUTCDATETIME()");

            builder.Property(p => p.UpdatedAt)
                   .HasColumnName("updated_at");

            // Foreign key to User (author)
            builder.HasOne(p => p.Author)
                   .WithMany()
                   .HasForeignKey(p => p.AuthorId)
                   .HasConstraintName("FK_posts_users_author")
                   .OnDelete(DeleteBehavior.Restrict);

            // Index for published posts
            builder.HasIndex(p => new { p.PublishedAt, p.IsPublished })
                   .HasDatabaseName("IX_posts_published");
        }
    }
}
