namespace BloodDonationSupport.Application.Features.References.DTOs.Response
{
    public class HealthConditionResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsDonationEligible { get; set; }
    }
}

