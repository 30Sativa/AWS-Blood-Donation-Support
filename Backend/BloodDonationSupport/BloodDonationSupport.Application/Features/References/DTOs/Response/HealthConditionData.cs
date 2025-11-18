namespace BloodDonationSupport.Application.Features.References.DTOs.Response
{
    public class HealthConditionData
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsDonationEligible { get; set; }
    }
}


