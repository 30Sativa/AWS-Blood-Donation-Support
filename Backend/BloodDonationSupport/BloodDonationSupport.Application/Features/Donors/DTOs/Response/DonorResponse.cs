namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    // Dùng cho GetAllDonors (staff xem danh sách)
    public class DonorResponse
    {
        public long DonorId { get; set; }          // Mã định danh người hiến
        public string? FullName { get; set; }       // Họ tên người hiến
        public string? BloodGroup { get; set; }     // Nhóm máu (A+, O-, ...)
        public bool IsReady { get; set; }           // Trạng thái sẵn sàng hiến
        public DateOnly? NextEligibleDate { get; set; } // Ngày được phép hiến tiếp
        public DateTime CreatedAt { get; set; }     // Ngày đăng ký hồ sơ
    }

    // Dùng cho GetDonorById (staff xem chi tiết)
    public class DonorDetail : DonorResponse
    {
        public string? Address { get; set; }                    // Địa chỉ (nếu có)
        public List<string>? Availabilities { get; set; }       // Thời gian sẵn sàng
        public List<string>? HealthConditions { get; set; }     // Tình trạng sức khỏe
        public string? LastKnownLocation { get; set; }          // Vị trí gần nhất (tùy chọn)
        public DateTime? UpdatedAt { get; set; }                // Ngày cập nhật gần nhất
    }
}
