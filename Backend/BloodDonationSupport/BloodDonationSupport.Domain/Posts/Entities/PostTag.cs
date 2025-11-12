using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Posts.Entities
{
    public class PostTag : BaseEntity<int>
    {
        public string TagName { get; private set; } = string.Empty;
        public string TagSlug { get; private set; } = string.Empty;

        private readonly List<Post> _posts = new();  // navigation ngược
        public IReadOnlyCollection<Post> Posts => _posts.AsReadOnly();

        private PostTag()
        { }

        public PostTag(string name, string slug)
        {
            TagName = name;
            TagSlug = slug;
        }

        // ✅ Factory dùng khi đọc từ DB
        public static PostTag Rehydrate(int id, string tagName, string tagSlug)
        {
            return new PostTag
            {
                Id = id,
                TagName = tagName,
                TagSlug = tagSlug
            };
        }
    }
}