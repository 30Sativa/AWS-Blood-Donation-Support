using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorHealthConditionDomain : BaseEntity<(long DonorId, int ConditionId)>
    {
        public long DonorId => Id.DonorId;
        public int ConditionId => Id.ConditionId;

        private DonorHealthConditionDomain() { } // EF Core cần

        private DonorHealthConditionDomain(long donorId, int conditionId)
        {
            Id = (donorId, conditionId);
        }

        public static DonorHealthConditionDomain Create(long donorId, int conditionId)
            => new(donorId, conditionId);
    }
}
