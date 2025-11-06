using BloodDonationSupport.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Behaviors
{
    public class AuditingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    {
        private readonly IAuditService _auditService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditingBehavior(IAuditService auditService, IHttpContextAccessor httpContextAccessor)
        {
            _auditService = auditService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var response = await next();

            // Chỉ log Command (Query không cần) và bỏ qua các hành động refresh token
            var requestTypeName = typeof(TRequest).Name;
            var isCommand = requestTypeName.EndsWith("Command", StringComparison.OrdinalIgnoreCase);
            var isRefreshToken = requestTypeName.Contains("RefreshToken", StringComparison.OrdinalIgnoreCase)
                                  || requestTypeName.Contains("TokenRefresh", StringComparison.OrdinalIgnoreCase);

            if (isCommand && !isRefreshToken)
            {
                var http = _httpContextAccessor.HttpContext;
                var ip = http?.Connection?.RemoteIpAddress?.ToString();
                var userIdClaim = http?.User?.Claims.FirstOrDefault(c => c.Type == "sub" || c.Type == "user_id")?.Value;

                long? userId = long.TryParse(userIdClaim, out var uid) ? uid : null;

                var requestJson = JsonSerializer.Serialize(request);
                var responseJson = JsonSerializer.Serialize(response);

                await _auditService.LogAsync(
                    userId,
                    action: requestTypeName,
                    entityType: requestTypeName.Replace("Command", "").ToUpper(),
                    entityId: null,
                    oldValue: null,
                    newValue: requestJson,
                    detailsJson: responseJson,
                    ipAddress: ip
                );
            }

            return response;
        }
    }
}
