using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AuditService> _logger;

        public AuditService(AppDbContext context, IUnitOfWork unitOfWork, ILogger<AuditService> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task LogAsync(
            long? userId,
            string action,
            string entityType,
            string? entityId,
            string? oldValue,
            string? newValue,
            string? detailsJson,
            string? ipAddress)
        {
            try
            {
                var log = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    OldValue = oldValue,
                    NewValue = newValue,
                    DetailsJson = detailsJson,
                    IpAddress = ipAddress,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AuditLogs.Add(log);
                // Use UnitOfWork to save instead of calling SaveChanges directly on context
                // This ensures proper transaction handling
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the main operation
                // Audit logging should be non-blocking
                _logger.LogError(ex, "Failed to save audit log for action: {Action}, EntityType: {EntityType}", action, entityType);
                // Optionally, you could add to a background queue or retry mechanism here
            }
        }
    }
}