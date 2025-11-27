namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class MatchResponse
    {
        public long MatchId { get; set; }
        public long RequestId { get; set; }
        public long DonorId { get; set; }
        public decimal? CompatibilityScore { get; set; }
        public decimal DistanceKm { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? ContactedAt { get; set; }
        public string? Response { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}