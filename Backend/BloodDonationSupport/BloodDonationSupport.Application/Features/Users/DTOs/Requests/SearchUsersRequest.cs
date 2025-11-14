namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class SearchUsersRequest
    {
        public string? Keyword { get; set; }
        public string? RoleCode { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

