namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = default!;
        public string RefreshToken { get; set; } = default!;
        public int ExpiresIn { get; set; }
        public AuthResponse User { get; set; } = default!;
        public List<string> Roles { get; set; } = new List<string>();
    }
}