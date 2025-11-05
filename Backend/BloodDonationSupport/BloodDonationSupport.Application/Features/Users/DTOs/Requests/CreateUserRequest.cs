namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class CreateUserRequest
    {
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string FullName { get; set; } = null!;
        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
        public string RoleCode { get; set; } = "MEMBER"; // ADMIN chọn: ADMIN / STAFF / MEMBER
    }
}