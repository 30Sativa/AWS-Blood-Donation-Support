using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BloodDonationSupport.Infrastructure.Persistence.Configurations
{
    public class PostTagConfiguration : IEntityTypeConfiguration<PostTag>
    {
        public void Configure(EntityTypeBuilder<PostTag> builder)
        {
            builder.ToTable("post_tags");

            builder.HasKey(pt => pt.TagId)
                   .HasName("PK_post_tags");

            builder.Property(pt => pt.TagId)
                   .HasColumnName("tag_id")
                   .ValueGeneratedOnAdd();

            builder.Property(pt => pt.TagName)
                   .HasColumnName("tag_name")
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasIndex(pt => pt.TagName)
                   .IsUnique()
                   .HasDatabaseName("IX_post_tags_tag_name");

            builder.Property(pt => pt.TagSlug)
                   .HasColumnName("tag_slug")
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasIndex(pt => pt.TagSlug)
                   .IsUnique()
                   .HasDatabaseName("IX_post_tags_tag_slug");

            // Many-to-many relationship with Post via post_tag_mappings
            builder.HasMany(pt => pt.Posts)
                   .WithMany(p => p.Tags)
                   .UsingEntity<Dictionary<string, object>>(
                       "post_tag_mappings",
                       j => j.HasOne<Post>()
                             .WithMany()
                             .HasForeignKey("post_id"),
                       j => j.HasOne<PostTag>()
                             .WithMany()
                             .HasForeignKey("tag_id"),
                       j =>
                       {
                           j.HasKey("post_id", "tag_id")
                            .HasName("PK_post_tag_mappings");
                           j.ToTable("post_tag_mappings");
                       });
        }
    }
}