namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class RegisterUserRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? PhoneNumber { get; set; }
        public string FullName { get; set; } = default!; // Required theo schema user_profiles
        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
    }
}