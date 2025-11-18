namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class DonorAvailabilityResponse
    {
        public long DonorId { get; set; }
        public List<AvailabilityItem> Availabilities { get; set; } = new();

        public class AvailabilityItem
        {
            public byte Weekday { get; set; }
            public short TimeFromMin { get; set; }
            public short TimeToMin { get; set; }
        }
    }
}

