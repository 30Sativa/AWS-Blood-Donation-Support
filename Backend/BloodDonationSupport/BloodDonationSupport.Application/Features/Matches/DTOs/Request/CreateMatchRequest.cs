namespace BloodDonationSupport.Application.Features.Matches.DTOs.Request
{
    public class CreateMatchRequest
    {
        public long RequestId { get; set; }
        public long DonorId { get; set; }
        public decimal? CompatibilityScore { get; set; }
        public decimal DistanceKm { get; set; }
    }
}

