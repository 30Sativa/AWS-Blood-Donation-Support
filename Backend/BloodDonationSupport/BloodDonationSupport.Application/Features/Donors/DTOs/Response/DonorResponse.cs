namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    // Dùng cho GetAllDonors (staff xem danh sách)
    public class DonorResponse
    {
        public long DonorId { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string? BloodGroup { get; set; }
        public bool IsReady { get; set; }
        public string? AddressDisplay { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}