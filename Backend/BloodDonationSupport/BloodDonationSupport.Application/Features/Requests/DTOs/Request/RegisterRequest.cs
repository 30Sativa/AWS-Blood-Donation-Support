namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class RegisterRequest
    {
        public long RequesterUserId { get; set; }
        public string Urgency { get; set; } = "NORMAL"; // LOW, NORMAL, HIGH
        public int BloodTypeId { get; set; }
        public int ComponentId { get; set; }
        public int QuantityUnits { get; set; }
        public DateTime? NeedBeforeUtc { get; set; }
        public long? DeliveryAddressId { get; set; }
        public string? DeliveryAddress { get; set; }

        public string? ClinicalNotes { get; set; }
    }
}