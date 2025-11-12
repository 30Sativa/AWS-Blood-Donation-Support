using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
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

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(RequestDomain domainEntity)
        {
            var entity = new Request
            {
                RequesterUserId = domainEntity.RequesterUserId,
                Urgency = domainEntity.Urgency.ToString(),
                BloodTypeId = domainEntity.BloodTypeId,
                ComponentId = domainEntity.ComponentId,
                QuantityUnits = domainEntity.QuantityUnits,
                NeedBeforeUtc = domainEntity.NeedBeforeUtc,
                DeliveryAddressId = domainEntity.DeliveryAddressId,
                Status = domainEntity.Status.ToString(),
                ClinicalNotes = domainEntity.ClinicalNotes,
                CreatedAt = domainEntity.CreatedAt,
                UpdatedAt = domainEntity.UpdatedAt
            };

            await _context.Requests.AddAsync(entity);
            await _context.SaveChangesAsync();

            // Đồng bộ lại ID cho domain
            domainEntity.GetType().GetProperty("Id")?.SetValue(domainEntity, entity.RequestId);
        }

        // =========================
        // DELETE
        // =========================
        public void Delete(RequestDomain domainEntity)
        {
            var req = _context.Requests.FirstOrDefault(r => r.RequestId == domainEntity.Id);
            if (req != null)
                _context.Requests.Remove(req);
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<bool> ExistsAsync(Expression<Func<RequestDomain, bool>> predicate)
        {
            // Hỗ trợ kiểm tra đơn giản: r => r.Id == x
            if (predicate.Body is BinaryExpression binaryExpr && binaryExpr.Left is MemberExpression left)
            {
                if (left.Member.Name == nameof(RequestDomain.Id))
                {
                    object? value = null;

                    // d => d.Id == 5
                    if (binaryExpr.Right is ConstantExpression constExpr)
                        value = constExpr.Value;

                    // d => d.Id == id
                    else if (binaryExpr.Right is MemberExpression memberExpr)
                    {
                        var objectMember = Expression.Convert(memberExpr, typeof(object));
                        var getterLambda = Expression.Lambda<Func<object>>(objectMember);
                        var getter = getterLambda.Compile();
                        value = getter();
                    }

                    if (value is long id)
                        return await _context.Requests.AnyAsync(r => r.RequestId == id);
                }
            }

            // fallback
            return false;
        }

        // =========================
        // FIND (basic)
        // =========================
        public async Task<IEnumerable<RequestDomain>> FindAsync(Expression<Func<RequestDomain, bool>> predicate)
        {
            var list = await _context.Requests.AsNoTracking().ToListAsync();
            return list.Select(MapToDomain);
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<IEnumerable<RequestDomain>> GetAllAsync()
        {
            var list = await _context.Requests.AsNoTracking().ToListAsync();
            return list.Select(MapToDomain);
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<RequestDomain?> GetByIdAsync(object id)
        {
            if (id is long requestId)
            {
                var entity = await _context.Requests.AsNoTracking()
                    .Include(r => r.BloodType)
                    .Include(r => r.Component)
                    .FirstOrDefaultAsync(r => r.RequestId == requestId);

                return entity == null ? null : MapToDomain(entity);
            }
            return null;
        }

        // =========================
        // PAGINATION
        // =========================
        public async Task<(IEnumerable<RequestDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Requests.AsNoTracking();
            var totalCount = await query.CountAsync();

            var list = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (list.Select(MapToDomain), totalCount);
        }

        // =========================
        // UPDATE
        // =========================
        public void Update(RequestDomain domainEntity)
        {
            var entity = _context.Requests.FirstOrDefault(r => r.RequestId == domainEntity.Id);
            if (entity == null) return;

            entity.Status = domainEntity.Status.ToString();
            entity.ClinicalNotes = domainEntity.ClinicalNotes;
            entity.UpdatedAt = DateTime.UtcNow;

            _context.Requests.Update(entity);
        }

        // =========================
        // MAPPING
        // =========================
        private static RequestDomain MapToDomain(Request entity)
        {
            // Parse Enum safely
            Enum.TryParse(entity.Urgency, out UrgencyLevel urgency);
            Enum.TryParse(entity.Status, out RequestStatus status);

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
                updatedAt: entity.UpdatedAt
            );
        }
    }
}
