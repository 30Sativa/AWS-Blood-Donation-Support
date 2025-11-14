namespace BloodDonationSupport.Application.Features.Posts.DTOs.Request
{
    public class GetPublishedPostsRequest
    {
        public string? TagSlug { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

