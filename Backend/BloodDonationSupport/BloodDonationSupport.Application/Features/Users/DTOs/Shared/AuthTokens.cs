namespace BloodDonationSupport.Application.Features.Users.DTOs.Shared
{
    public class AuthTokens
    {
        public string AccessToken { get; set; } = default!;
        public string RefreshToken { get; set; } = default!;
        public string IdToken { get; set; } = default!;
        public int ExpiresIn { get; set; }
    }
}