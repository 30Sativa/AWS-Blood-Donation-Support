using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class RequestRepository : IRequestRepository
    {
        private readonly AppDbContext _context;

        public RequestRepository(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // ADD
        // ============================================================
        public async Task AddAsync(RequestDomain domain)
        {
            var entity = new Request
            {
                RequesterUserId = domain.RequesterUserId,
                Urgency = domain.Urgency.ToString(),
                BloodTypeId = domain.BloodTypeId,
                ComponentId = domain.ComponentId,
                QuantityUnits = domain.QuantityUnits,
                NeedBeforeUtc = domain.NeedBeforeUtc,
                DeliveryAddressId = domain.DeliveryAddressId,
                Status = domain.Status.ToString(),
                ClinicalNotes = domain.ClinicalNotes,
                CreatedAt = domain.CreatedAt,
                UpdatedAt = domain.UpdatedAt,

                // 🔥 MUST MAP LOCATION (FIXED)
                Latitude = domain.Location?.Latitude,
                Longitude = domain.Location?.Longitude
            };

            await _context.Requests.AddAsync(entity);
            domain.SetId(entity.RequestId);
        }

        // ============================================================
        // DELETE
        // ============================================================
        public void Delete(RequestDomain domain)
        {
            var entity = _context.Requests.FirstOrDefault(r => r.RequestId == domain.Id);
            if (entity != null)
                _context.Requests.Remove(entity);
        }

        // ============================================================
        // EXISTS
        // ============================================================
        public async Task<bool> ExistsAsync(Expression<Func<RequestDomain, bool>> predicate)
        {
            // Support simple predicate: r => r.Id == x
            if (predicate.Body is BinaryExpression binaryExpr &&
                binaryExpr.Left is MemberExpression left &&
                left.Member.Name == nameof(RequestDomain.Id))
            {
                object? val = null;

                if (binaryExpr.Right is ConstantExpression c)
                    val = c.Value;
                else if (binaryExpr.Right is MemberExpression m)
                {
                    var lambda = Expression.Lambda<Func<object>>(Expression.Convert(m, typeof(object)));
                    val = lambda.Compile()();
                }

                if (val is long id)
                    return await _context.Requests.AnyAsync(r => r.RequestId == id);
            }

            return false;
        }

        // ============================================================
        // FIND (Not used -> return all. Optional)
        // ============================================================
        public async Task<IEnumerable<RequestDomain>> FindAsync(Expression<Func<RequestDomain, bool>> predicate)
        {
            // Load all -> Map -> Apply predicate in-memory
            var entities = await _context.Requests.AsNoTracking().ToListAsync();
            var domains = entities.Select(MapToDomain);
            return domains.Where(predicate.Compile());
        }

        // ============================================================
        // GET ALL (dangerous for large DB -> optional)
        // ============================================================
        public async Task<IEnumerable<RequestDomain>> GetAllAsync()
        {
            var entities = await _context.Requests
                .AsNoTracking()
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return entities.Select(MapToDomain);
        }

        // ============================================================
        // GET BY ID
        // ============================================================
        public async Task<RequestDomain?> GetByIdAsync(object id)
        {
            if (id is not long requestId)
                return null;

            var entity = await _context.Requests
                .AsNoTracking()
                .Include(r => r.BloodType)
                .Include(r => r.Component)
                // Optional: Include delivery address if needed
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            return entity == null ? null : MapToDomain(entity);
        }

        // ============================================================
        // PAGINATION
        // ============================================================
        public async Task<(IEnumerable<RequestDomain> Items, int TotalCount)>
            GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Requests.AsNoTracking();
            var totalCount = await query.CountAsync();

            var entities = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (entities.Select(MapToDomain), totalCount);
        }

        // ============================================================
        // UPDATE
        // ============================================================
        public void Update(RequestDomain domain)
        {
            var entity = _context.Requests.FirstOrDefault(r => r.RequestId == domain.Id);
            if (entity == null)
                return;

            entity.Status = domain.Status.ToString();
            entity.ClinicalNotes = domain.ClinicalNotes;
            entity.UpdatedAt = DateTime.UtcNow;

            // 🔥 Important: sync location if changed
            if (domain.Location != null)
            {
                entity.Latitude = domain.Location.Latitude;
                entity.Longitude = domain.Location.Longitude;
            }

            _context.Requests.Update(entity);
        }

        // ============================================================
        // GET LATEST REQUEST ID
        // ============================================================
        public async Task<long?> GetLatestRequestIdByRequesterIdAsync(long requesterUserId)
        {
            // First check tracked entities
            var tracked = _context.ChangeTracker
                .Entries<Request>()
                .Where(e => (e.State == EntityState.Added || e.State == EntityState.Unchanged)
                            && e.Entity.RequesterUserId == requesterUserId)
                .OrderByDescending(e => e.Entity.CreatedAt)
                .Select(e => e.Entity)
                .FirstOrDefault();

            if (tracked?.RequestId > 0)
                return tracked.RequestId;

            // DB fallback
            var latest = await _context.Requests
                .Where(r => r.RequesterUserId == requesterUserId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            return latest?.RequestId;
        }

        // ============================================================
        // MAPPING (DB TO DOMAIN)
        // ============================================================
        private static RequestDomain MapToDomain(Request entity)
        {
            Enum.TryParse(entity.Urgency, out UrgencyLevel urgency);
            Enum.TryParse(entity.Status, out RequestStatus status);

            GeoLocation? location = null;
            if (entity.Latitude.HasValue && entity.Longitude.HasValue)
            {
                location = GeoLocation.Create(entity.Latitude.Value, entity.Longitude.Value);
            }

            return RequestDomain.Rehydrate(
                id: entity.RequestId,
                requesterUserId: entity.RequesterUserId,
                urgency: urgency,
                bloodTypeId: entity.BloodTypeId,
                componentId: entity.ComponentId,
                quantityUnits: entity.QuantityUnits,
                needBeforeUtc: entity.NeedBeforeUtc,
                deliveryAddressId: entity.DeliveryAddressId,
                status: status,
                clinicalNotes: entity.ClinicalNotes,
                createdAt: entity.CreatedAt,
                updatedAt: entity.UpdatedAt,
                location: location
            );
        }
    }
}
