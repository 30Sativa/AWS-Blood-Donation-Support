using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using AuditLogDomain = BloodDonationSupport.Domain.Common.Entites.AuditLog;
using AuditLogEntity = BloodDonationSupport.Infrastructure.Persistence.Models.AuditLog;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly AppDbContext _context;

        public AuditLogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<AuditLogDomain> Items, int TotalCount)> GetByUserIdAsync(
            long userId,
            int pageNumber,
            int pageSize)
        {
            var query = _context.AuditLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt);

            var totalCount = await query.CountAsync();

            var logs = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = logs.Select(MapToDomain);
            return (items, totalCount);
        }

        private static AuditLogDomain MapToDomain(AuditLogEntity entity) =>
            new()
            {
                AuditId = entity.AuditId,
                UserId = entity.UserId,
                Action = entity.Action,
                EntityType = entity.EntityType,
                EntityId = entity.EntityId,
                OldValue = entity.OldValue,
                NewValue = entity.NewValue,
                DetailsJson = entity.DetailsJson,
                IpAddress = entity.IpAddress,
                CreatedAt = entity.CreatedAt
            };
    }
}