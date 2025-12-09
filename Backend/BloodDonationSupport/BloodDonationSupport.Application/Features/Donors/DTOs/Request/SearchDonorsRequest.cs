namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class SearchDonorsRequest
    {
        public string? Keyword { get; set; }
        public int? BloodTypeId { get; set; }
        public bool? IsReady { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}