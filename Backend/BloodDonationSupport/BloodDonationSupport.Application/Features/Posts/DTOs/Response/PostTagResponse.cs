namespace BloodDonationSupport.Application.Features.Posts.DTOs.Response
{
    public class PostTagResponse
    {
        public int Id { get; set; }
        public string TagName { get; set; } = string.Empty;
        public string TagSlug { get; set; } = string.Empty;
    }
}

