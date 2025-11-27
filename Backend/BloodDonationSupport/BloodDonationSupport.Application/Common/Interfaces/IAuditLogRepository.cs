using BloodDonationSupport.Domain.Common.Entites;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAuditLogRepository
    {
        Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetByUserIdAsync(
            long userId,
            int pageNumber,
            int pageSize);
    }
}