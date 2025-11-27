namespace BloodDonationSupport.Domain.Requests.Entities
{
    public class CompatibilityRuleDomain
    {
        public int DonorBloodTypeId { get; }
        public int RecipientBloodTypeId { get; }
        public int ComponentId { get; }
        public bool IsCompatible { get; }
        public int PriorityLevel { get; }

        public CompatibilityRuleDomain(
            int donorType,
            int recipientType,
            int componentId,
            bool isCompatible,
            int priority)
        {
            DonorBloodTypeId = donorType;
            RecipientBloodTypeId = recipientType;
            ComponentId = componentId;
            IsCompatible = isCompatible;
            PriorityLevel = priority;
        }
    }
}