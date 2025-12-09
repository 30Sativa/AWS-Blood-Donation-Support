using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorHealthConditionDomain : BaseEntity<(long DonorId, int ConditionId)>
    {
        public long DonorId => Id.DonorId;
        public int ConditionId => Id.ConditionId;
        public string? ConditionName { get; private set; }

        private DonorHealthConditionDomain()
        { } // EF Core cần

        private DonorHealthConditionDomain(long donorId, int conditionId, string? conditionName = null)
        {
            Id = (donorId, conditionId);
            ConditionName = conditionName;
        }

        public static DonorHealthConditionDomain Create(long donorId, int conditionId)
            => new(donorId, conditionId);

        public static DonorHealthConditionDomain Rehydrate(long donorId, int conditionId, string? conditionName)
            => new(donorId, conditionId, conditionName);
    }
}