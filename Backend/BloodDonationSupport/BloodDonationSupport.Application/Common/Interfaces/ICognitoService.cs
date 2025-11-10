using BloodDonationSupport.Application.Features.Users.DTOs.Shared;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ICognitoService
    {
        Task<string> RegisterUserAsync(string email, string password, string? phonenumber);

        Task<AuthTokens?> LoginAsync(string email, string password);

        Task<AuthTokens?> RefreshTokenAsync(string refreshToken);

        Task<bool?> ValidationTokenAsync(string accessToken);

        Task UpdateUserAsync(string cognitoUserId, string? newEmail, string? newPhoneNumber);

        Task DeleteUserAsync(string cognitoUserId);

        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ConfirmForgotPasswordAsync(string email, string confirmationCode, string newPassword);

        Task<bool> ConfirmEmailAsync(string email, string confirmationCode);

    }
}