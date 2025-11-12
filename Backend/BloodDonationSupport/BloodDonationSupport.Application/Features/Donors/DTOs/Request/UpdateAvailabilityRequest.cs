namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateAvailabilityRequest
    {
        public List<AvailabilityItem> Availabilities { get; set; } = new();

        public class AvailabilityItem
        {
            public byte Weekday { get; set; }     // 0=CN..6=Thứ 7
            public short TimeFromMin { get; set; }
            public short TimeToMin { get; set; }
        }
    }
}