namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Post
{
    public long PostId { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? Excerpt { get; set; }

    public long AuthorId { get; set; }

    public DateTime? PublishedAt { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User Author { get; set; } = null!;

    public virtual ICollection<PostTag> Tags { get; set; } = new List<PostTag>();
}