namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class RegisterDonorRequest
    {
        public long UserId { get; set; }
        public int BloodTypeId { get; set; }
        public decimal TravelRadiusKm { get; set; } = 10;

        // Address từ client chỉ cần 1 field
        public string FullAddress { get; set; } = string.Empty;

        public List<DonorAvailabilityDto>? Availabilities { get; set; }
        public List<int>? HealthConditionIds { get; set; }
    }

    // DTO con: lịch rảnh
    public class DonorAvailabilityDto
    {
        public byte Weekday { get; set; }        // 0=CN..6=Thứ 7
        public short TimeFromMin { get; set; }   // phút trong ngày
        public short TimeToMin { get; set; }
    }
}