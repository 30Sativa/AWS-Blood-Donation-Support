namespace BloodDonationSupport.Application.Features.Addresses.DTOs.Request
{
    public class UpdateAddressRequest
    {
        public string? Line1 { get; set; }
        public string? District { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string? NormalizedAddress { get; set; }
        public string? PlaceId { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}

