using BloodDonationSupport.Application.Features.Users.DTOs.Shared;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ICognitoService
    {
        Task<string> RegisterUserAsync(string email, string password, string? phonenumber);

        Task<AuthTokens?> LoginAsync(string email, string password);

        Task<AuthTokens?> RefreshTokenAsync(string refreshToken);

        Task<bool?> ValidationTokenAsync(string accessToken);
    }
}