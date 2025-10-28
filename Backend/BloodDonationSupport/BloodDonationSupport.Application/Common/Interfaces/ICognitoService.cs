using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
