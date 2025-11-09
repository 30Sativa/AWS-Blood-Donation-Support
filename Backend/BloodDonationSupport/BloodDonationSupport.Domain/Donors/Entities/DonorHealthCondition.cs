using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorHealthCondition : BaseEntity<(long DonorId, int ConditionId)>
    {
        public long DonorId => Id.DonorId;
        public int ConditionId => Id.ConditionId;

        private DonorHealthCondition() { } // EF Core cần

        private DonorHealthCondition(long donorId, int conditionId)
        {
            Id = (donorId, conditionId);
        }

        public static DonorHealthCondition Create(long donorId, int conditionId)
            => new(donorId, conditionId);
    }
}
