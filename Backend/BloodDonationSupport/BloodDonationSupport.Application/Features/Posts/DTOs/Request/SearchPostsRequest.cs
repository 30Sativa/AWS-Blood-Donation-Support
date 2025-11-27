namespace BloodDonationSupport.Application.Features.Posts.DTOs.Request
{
    public class SearchPostsRequest
    {
        public string? Keyword { get; set; }
        public string? TagSlug { get; set; }
        public bool? IsPublished { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}