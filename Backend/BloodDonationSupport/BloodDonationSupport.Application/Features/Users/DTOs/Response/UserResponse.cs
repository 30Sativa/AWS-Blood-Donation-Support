namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class UserResponse
    {
        public long Id { get; set; }
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string FullName { get; set; } = null!;
        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
        public string Role { get; set; } = null!;
        public string CognitoUserId { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}