namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class RegisterDonorRequest
    {
        // --- Liên kết bắt buộc ---
        public long UserId { get; set; }

        // --- Thông tin hồ sơ hiến máu ---
        public int? BloodTypeId { get; set; }

        public long? AddressId { get; set; }

        // --- Phạm vi & vị trí ---
        public decimal TravelRadiusKm { get; set; } = 10;

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // --- Trạng thái & điều kiện ---
        public bool IsReady { get; set; } = false;

        public DateOnly? NextEligibleDate { get; set; }

        // --- Lịch rảnh hiến máu (optional) ---
        public List<DonorAvailabilityDto>? Availabilities { get; set; }

        // --- Tình trạng sức khỏe (optional) ---
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