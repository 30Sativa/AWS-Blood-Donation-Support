using BloodDonationSupport.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Security.Claims;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public long? UserId
        {
            get
            {
                var userIdClaim = GetClaim("sub") ?? GetClaim("user_id") ?? GetClaim(ClaimTypes.NameIdentifier);
                if (long.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
                return null;
            }
        }

        public string? CognitoUserId => GetClaim("sub");

        public string? Email => GetClaim(ClaimTypes.Email) ?? GetClaim("email");

        public IReadOnlyCollection<string> Roles
        {
            get
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext?.User?.Identities == null)
                    return Array.Empty<string>();

                var roles = httpContext.User
                    .Claims
                    .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                    .Select(c => c.Value)
                    .ToList();

                return roles;
            }
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        private string? GetClaim(string claimType)
        {
            return _httpContextAccessor.HttpContext?.User?.Claims
                .FirstOrDefault(c => c.Type == claimType)
                ?.Value;
        }
    }
}

