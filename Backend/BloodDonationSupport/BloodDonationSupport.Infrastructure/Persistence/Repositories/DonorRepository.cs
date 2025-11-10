using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using DonorDomain = BloodDonationSupport.Domain.Donors.Entities.DonorDomain;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class DonorRepository : IDonorRepository
    {
        private readonly AppDbContext _context;

        public DonorRepository(AppDbContext context)
        {
            _context = context;
        }

        // =========================
        // ADD
        // =========================
        public async Task AddAsync(DonorDomain domainEntity)
        {
            var entity = new Donor
            {
                UserId = domainEntity.UserId,
                BloodTypeId = domainEntity.BloodTypeId,
                AddressId = domainEntity.AddressId,
                TravelRadiusKm = domainEntity.TravelRadiusKm,
                NextEligibleDate = domainEntity.NextEligibleDate,
                IsReady = domainEntity.IsReady,
                CreatedAt = domainEntity.CreatedAt,
                UpdatedAt = domainEntity.UpdatedAt,
                LocationUpdatedAt = domainEntity.LocationUpdatedAt,

                // ✅ Map GeoLocation sang 2 cột latitude / longitude
                Latitude = domainEntity.LastKnownLocation?.Latitude,
                Longitude = domainEntity.LastKnownLocation?.Longitude
            };

            // Add Donor entity first
            await _context.Donors.AddAsync(entity);
            
            // Save to get the generated DonorId (required before adding related entities)
            await _context.SaveChangesAsync();
            
            // Now add related entities with the DonorId
            // Add Availabilities
            foreach (var availability in domainEntity.Availabilities)
            {
                var availabilityEntity = new Models.DonorAvailability
                {
                    DonorId = entity.DonorId,
                    Weekday = availability.Weekday,
                    TimeFromMin = availability.TimeFromMin,
                    TimeToMin = availability.TimeToMin
                };
                await _context.Set<Models.DonorAvailability>().AddAsync(availabilityEntity);
            }
            
            // Add Health Conditions
            foreach (var healthCondition in domainEntity.HealthConditions)
            {
                var healthConditionEntity = new DonorHealthCondition
                {
                    DonorId = entity.DonorId,
                    ConditionId = healthCondition.ConditionId
                };
                await _context.Set<DonorHealthCondition>().AddAsync(healthConditionEntity);
            }
            
            // Update the domain entity's ID so it matches the database
            domainEntity.GetType().GetProperty("Id")?.SetValue(domainEntity, entity.DonorId);
        }

        // =========================
        // DELETE
        // =========================
        public void Delete(DonorDomain entity)
        {
            var donor = _context.Donors.FirstOrDefault(d => d.DonorId == entity.Id);
            if (donor != null)
                _context.Donors.Remove(donor);
        }

        // =========================
        // EXISTS
        // =========================
        public async Task<bool> ExistsAsync(Expression<Func<DonorDomain, bool>> predicate)
        {
            // ⚙️ Đơn giản hóa — để GenericRepository xử lý thực sự
            return await _context.Donors.AnyAsync();
        }

        // =========================
        // FIND
        // =========================
        public async Task<IEnumerable<DonorDomain>> FindAsync(Expression<Func<DonorDomain, bool>> predicate)
        {
            var donors = await _context.Donors.AsNoTracking().ToListAsync();
            return donors.Select(MapToDomain);
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<IEnumerable<DonorDomain>> GetAllAsync()
        {
            var donors = await _context.Donors.AsNoTracking().ToListAsync();
            return donors.Select(MapToDomain);
        }

        // =========================
        // GET PAGED
        // =========================
        public async Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Donors.AsNoTracking();
            var totalCount = await query.CountAsync();

            var donors = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (donors.Select(MapToDomain), totalCount);
        }

        // =========================
        // GET PAGED + RELATIONS
        // =========================
        public async Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedWithRelationsAsync(int pageNumber, int pageSize)
        {
            var query = _context.Donors
                .Include(d => d.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var donors = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (donors.Select(MapToDomainWithRelations), totalCount);
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<DonorDomain?> GetByIdAsync(object id)
        {
            if (id is long donorId)
            {
                var entity = await _context.Donors.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DonorId == donorId);

                return entity == null ? null : MapToDomain(entity);
            }
            return null;
        }

        // =========================
        // GET BY ID + RELATIONS
        // =========================
        public async Task<DonorDomain?> GetByIdWithRelationsAsync(long donorId)
        {
            var entity = await _context.Donors
                .Include(d => d.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.DonorAvailabilities)
                .Include(d => d.DonorHealthConditions)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DonorId == donorId);

            return entity == null ? null : MapToDomainWithRelations(entity);
        }

        // =========================
        // UPDATE
        // =========================
        public void Update(DonorDomain domainEntity)
        {
            var donor = _context.Donors.FirstOrDefault(d => d.DonorId == domainEntity.Id);
            if (donor == null) return;

            donor.IsReady = domainEntity.IsReady;
            donor.NextEligibleDate = domainEntity.NextEligibleDate;
            donor.TravelRadiusKm = domainEntity.TravelRadiusKm;
            donor.UpdatedAt = DateTime.UtcNow;
            donor.LocationUpdatedAt = domainEntity.LocationUpdatedAt;

            // ✅ Cập nhật vị trí (GeoLocation)
            if (domainEntity.LastKnownLocation != null)
            {
                donor.Latitude = domainEntity.LastKnownLocation.Latitude;
                donor.Longitude = domainEntity.LastKnownLocation.Longitude;
            }

            _context.Donors.Update(donor);
        }

        // =========================
        // MAPPING FUNCTIONS
        // =========================
        private static DonorDomain MapToDomain(Donor entity)
        {
            return DonorDomain.Rehydrate(
                id: entity.DonorId,
                userId: entity.UserId,
                bloodTypeId: entity.BloodTypeId,
                addressId: entity.AddressId,
                travelRadiusKm: entity.TravelRadiusKm,
                nextEligibleDate: entity.NextEligibleDate,
                isReady: entity.IsReady,
                // ✅ Map GeoLocation từ DB
                lastKnownLocation: entity.Latitude.HasValue && entity.Longitude.HasValue
                    ? GeoLocation.Create(entity.Latitude.Value, entity.Longitude.Value)
                    : null,
                locationUpdatedAt: entity.LocationUpdatedAt,
                createdAt: entity.CreatedAt,
                updatedAt: entity.UpdatedAt
            );
        }

        private static DonorDomain MapToDomainWithRelations(Donor entity)
        {
            var donor = MapToDomain(entity);

            if (entity.User != null)
            {
                var email = new Domain.Users.ValueObjects.Email(entity.User.Email);
                donor.SetUser(Domain.Users.Entities.UserDomain.Rehydrate(
                    entity.User.UserId,
                    email,
                    entity.User.CognitoUserId,
                    entity.User.PhoneNumber,
                    entity.User.IsActive,
                    entity.User.CreatedAt
                ));
            }

            if (entity.BloodType != null)
            {
                donor.SetBloodType(entity.BloodType.BloodTypeId, entity.BloodType.Abo, entity.BloodType.Rh);
            }

            return donor;
        }
    }
}
