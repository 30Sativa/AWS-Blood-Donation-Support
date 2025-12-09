using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorAvailability : BaseEntity<long>
    {
        public long DonorId { get; private set; }
        public byte Weekday { get; private set; }     // 0=CN..6=Thứ 7
        public short TimeFromMin { get; private set; }
        public short TimeToMin { get; private set; }

        private DonorAvailability()
        { } // EF Core

        private DonorAvailability(long donorId, byte weekday, short from, short to)
        {
            DonorId = donorId;
            Weekday = weekday;
            TimeFromMin = from;
            TimeToMin = to;
        }

        public static DonorAvailability Create(byte weekday, short from, short to)
        {
            if (weekday > 6)
                throw new ArgumentException("Weekday must be between 0 and 6.");
            if (from < 0 || to > 1440 || from >= to)
                throw new ArgumentException("Invalid time range.");

            return new DonorAvailability(0, weekday, from, to);
        }

        public static DonorAvailability Rehydrate(long id, long donorId, byte weekday, short from, short to)
        {
            return new DonorAvailability(donorId, weekday, from, to)
            {
                Id = id
            };
        }

        public void AssignToDonor(long donorId)
        {
            if (DonorId != 0 && DonorId != donorId)
                throw new InvalidOperationException("Availability already assigned to another donor.");

            DonorId = donorId;
        }

        public override string ToString() => $"Thứ {Weekday}: {TimeFromMin}-{TimeToMin}";
    }
}