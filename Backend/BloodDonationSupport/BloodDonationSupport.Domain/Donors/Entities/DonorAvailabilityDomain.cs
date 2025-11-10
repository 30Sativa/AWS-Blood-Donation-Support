using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorAvailability : BaseEntity<long>
    {
        public long DonorId { get; private set; }
        public byte Weekday { get; private set; }     // 0=CN..6=Thứ 7
        public short TimeFromMin { get; private set; }
        public short TimeToMin { get; private set; }

        private DonorAvailability() { } // For EF Core

        private DonorAvailability(long donorId, byte weekday, short from, short to)
        {
            DonorId = donorId;
            Weekday = weekday;
            TimeFromMin = from;
            TimeToMin = to;
        }

        public static DonorAvailability Create(byte weekday, short from, short to)
        {
            return new DonorAvailability(0, weekday, from, to);
        }

        public static DonorAvailability Rehydrate(long id, long donorId, byte weekday, short from, short to)
        {
            return new DonorAvailability(donorId, weekday, from, to)
            {
                Id = id
            };
        }
    }
}
