using BloodDonationSupport.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
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

        public string? CognitoUserId
        {
            get
            {
                var sub = GetClaim("sub");
                if (sub == null)
                {
                    // Log all available claims for debugging
                    var httpContext = _httpContextAccessor.HttpContext;
                    if (httpContext?.User?.Claims != null)
                    {
                        var allClaims = httpContext.User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
                        _logger.LogWarning("CognitoUserId is null. Available claims: {Claims}", string.Join(", ", allClaims));
                    }
                }
                return sub;
            }
        }

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
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Claims == null)
                return null;

            var claim = httpContext.User.Claims.FirstOrDefault(c =>
                c.Type == claimType ||
                c.Type == ClaimTypes.NameIdentifier && claimType == "sub");

            return claim?.Value;
        }
    }
}