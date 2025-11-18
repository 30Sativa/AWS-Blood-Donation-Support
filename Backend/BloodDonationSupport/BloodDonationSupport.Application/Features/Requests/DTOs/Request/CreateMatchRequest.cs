namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class CreateMatchRequest
    {
        public long DonorId { get; set; }
        public decimal? CompatibilityScore { get; set; }
        public decimal DistanceKm { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING, CONTACTED, ACCEPTED, REJECTED
        public string? Response { get; set; }
    }
}

