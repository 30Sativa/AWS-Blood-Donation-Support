namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class DonorAvailabilityResponse
    {
        public byte Weekday { get; set; }
        public short TimeFromMin { get; set; }
        public short TimeToMin { get; set; }
    }
}

