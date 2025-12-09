namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class UserWithProfileResponse
    {
        public long UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? CognitoUserId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Roles (read-only): Chỉ để hiển thị thông tin, không thể update qua form profile
        // Roles được quản lý bởi Admin qua endpoint PUT /api/users/{id}/roles
        public List<string> Roles { get; set; } = new();

        // Profile Info
        public string? FullName { get; set; }

        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
        public bool? PrivacyPhoneVisibleToStaffOnly { get; set; }
    }
}