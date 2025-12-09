namespace BloodDonationSupport.Application.Features.Posts.DTOs.Request
{
    public class CreatePostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public long AuthorId { get; set; }
        public bool IsPublished { get; set; } = false;
        public List<string>? TagNames { get; set; } = new();
    }
}