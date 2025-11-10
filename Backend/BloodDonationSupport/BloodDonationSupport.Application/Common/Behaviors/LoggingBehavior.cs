using BloodDonationSupport.Application.Common.Interfaces;
using MediatR;
using System.Text.Json;

namespace BloodDonationSupport.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IAuditService _auditService;

        public LoggingBehavior(IAuditService auditService)
        {
            _auditService = auditService;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Only audit command-like requests by naming convention
            var requestTypeName = typeof(TRequest).Name;
            var isCommand = requestTypeName.EndsWith("Command", StringComparison.OrdinalIgnoreCase);
            var isRefreshToken = requestTypeName.Contains("RefreshToken", StringComparison.OrdinalIgnoreCase)
                                  || requestTypeName.Contains("TokenRefresh", StringComparison.OrdinalIgnoreCase);

            var response = await next();

            if (isCommand && !isRefreshToken)
            {
                string detailsJson;
                try
                {
                    detailsJson = JsonSerializer.Serialize(request, new JsonSerializerOptions
                    {
                        WriteIndented = false,
                        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
                    });
                }
                catch
                {
                    detailsJson = "{}";
                }

                // We don't have current user or ip infrastructure yet, so pass nulls
                await _auditService.LogAsync(
                    userId: null,
                    action: requestTypeName,
                    entityType: requestTypeName,
                    entityId: null,
                    oldValue: null,
                    newValue: null,
                    detailsJson: detailsJson,
                    ipAddress: null);
            }

            return response;
        }
    }
}