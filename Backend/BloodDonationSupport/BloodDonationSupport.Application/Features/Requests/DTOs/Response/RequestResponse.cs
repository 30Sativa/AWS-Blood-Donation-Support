namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class RequestResponse
    {
        public long RequestId { get; set; }
        public long RequesterUserId { get; set; }
        public string Urgency { get; set; } = string.Empty;
        public int BloodTypeId { get; set; }
        public int ComponentId { get; set; }
        public int QuantityUnits { get; set; }
        public DateTime? NeedBeforeUtc { get; set; }
        public long? DeliveryAddressId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ClinicalNotes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}