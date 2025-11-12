namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(
            long? userId,
            string action,
            string entityType,
            string? entityId,
            string? oldValue,
            string? newValue,
            string? detailsJson,
            string? ipAddress);
    }
}