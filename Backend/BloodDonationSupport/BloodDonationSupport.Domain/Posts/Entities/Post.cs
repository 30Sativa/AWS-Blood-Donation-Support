using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Posts.ValueObjects;

namespace BloodDonationSupport.Domain.Posts.Entities
{
    public class Post : AggregateRoot<long>
    {
        private readonly List<PostTag> _tags = new(); // giữ danh sách tag liên kết

        public PostTitle Title { get; private set; } = null!;
        public PostSlug Slug { get; private set; } = null!;
        public string Content { get; private set; } = string.Empty;
        public string? Excerpt { get; private set; }
        public long AuthorId { get; private set; }
        public bool IsPublished { get; private set; }
        public DateTime? PublishedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        // ✅ navigation property để EF load tags
        public IReadOnlyCollection<PostTag> Tags => _tags.AsReadOnly();

        private Post() { } // EF cần constructor rỗng

        public Post(PostTitle title, PostSlug slug, string content, string? excerpt, long authorId)
        {
            Title = title;
            Slug = slug;
            Content = content;
            Excerpt = excerpt;
            AuthorId = authorId;
            CreatedAt = DateTime.UtcNow;
        }

        public void AddTag(PostTag tag)
        {
            if (_tags.All(t => t.Id != tag.Id))
                _tags.Add(tag);
        }

        public void ClearTags() => _tags.Clear();

        public void Publish()
        {
            if (!IsPublished)
            {
                IsPublished = true;
                PublishedAt = DateTime.UtcNow;
            }
        }

        public void UpdateContent(string content, string? excerpt)
        {
            Content = content;
            Excerpt = excerpt;
            UpdatedAt = DateTime.UtcNow;
        }

        // ✅ Factory dùng khi đọc từ DB (giống UserDomain.Rehydrate)
        public static Post Rehydrate(
            long id,
            PostTitle title,
            PostSlug slug,
            string content,
            string? excerpt,
            long authorId,
            bool isPublished,
            DateTime createdAt,
            DateTime? publishedAt)
        {
            var post = new Post
            {
                Id = id,
                Title = title,
                Slug = slug,
                Content = content,
                Excerpt = excerpt,
                AuthorId = authorId,
                IsPublished = isPublished,
                CreatedAt = createdAt,
                PublishedAt = publishedAt
            };
            return post;
        }

        // ✅ Factory khi load thêm tags
        public static Post RehydrateWithTags(
            long id,
            PostTitle title,
            PostSlug slug,
            string content,
            string? excerpt,
            long authorId,
            bool isPublished,
            DateTime createdAt,
            DateTime? publishedAt,
            IEnumerable<PostTag> tags)
        {
            var post = Rehydrate(id, title, slug, content, excerpt, authorId, isPublished, createdAt, publishedAt);
            foreach (var tag in tags)
                post.AddTag(tag);
            return post;
        }
    }
}
