namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class RegisterRequestResponse
    {
        public long RequestId { get; set; }
        public long RequesterUserId { get; set; }
        public string Urgency { get; set; } = default!;
        public int BloodTypeId { get; set; }
        public int ComponentId { get; set; }
        public int QuantityUnits { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}