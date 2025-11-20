using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Linq.Expressions;
using DonorDomain = BloodDonationSupport.Domain.Donors.Entities.DonorDomain;
using DonorAvailabilityModel = BloodDonationSupport.Infrastructure.Persistence.Models.DonorAvailability;
using DonorHealthConditionModel = BloodDonationSupport.Infrastructure.Persistence.Models.DonorHealthCondition;

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

            // Add Availabilities using navigation property (EF Core will set DonorId automatically)
            foreach (var availability in domainEntity.Availabilities)
            {
                entity.DonorAvailabilities.Add(new DonorAvailabilityModel
                {
                    Weekday = availability.Weekday,
                    TimeFromMin = availability.TimeFromMin,
                    TimeToMin = availability.TimeToMin
                });
            }
            
            // Add Health Conditions using navigation property (EF Core will set DonorId automatically)
            foreach (var healthCondition in domainEntity.HealthConditions)
            {
                entity.DonorHealthConditions.Add(new DonorHealthConditionModel
                {
                    ConditionId = healthCondition.ConditionId
                });
            }

            // Add Donor entity (with related entities) - let UnitOfWork handle SaveChanges
            await _context.Donors.AddAsync(entity);
            
            // Note: Don't SaveChanges here - let UnitOfWork manage it
            // The DonorId will be set after SaveChangesAsync is called
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
            var bin = (BinaryExpression)predicate.Body;
            var userId = (long)((ConstantExpression)bin.Right).Value;

            return await _context.Donors.AnyAsync(d => d.UserId == userId);
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

        public async Task<(IEnumerable<DonorDomain> Items, int TotalCount)> SearchAsync(
            string? keyword,
            int? bloodTypeId,
            bool? isReady,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Donors
                .Include(d => d.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalized = keyword.Trim().ToLower();
                query = query.Where(d =>
                    d.User.Email.ToLower().Contains(normalized) ||
                    (d.User.UserProfile != null &&
                        d.User.UserProfile.FullName != null &&
                        d.User.UserProfile.FullName.ToLower().Contains(normalized)) ||
                    (!string.IsNullOrEmpty(d.User.PhoneNumber) &&
                        d.User.PhoneNumber.ToLower().Contains(normalized)));
            }

            if (bloodTypeId.HasValue)
            {
                query = query.Where(d => d.BloodTypeId == bloodTypeId.Value);
            }

            if (isReady.HasValue)
            {
                query = query.Where(d => d.IsReady == isReady.Value);
            }

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
        // GET DONOR ID BY USER ID
        // =========================
        public async Task<long> GetDonorIdByUserIdAsync(long userId)
        {
            var donor = await _context.Donors
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId);
            return donor?.DonorId ?? 0;
        }

        public async Task<DonorDomain?> GetByUserIdAsync(long userId)
        {
            var entity = await _context.Donors
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<DonorDomain?> GetByUserIdWithRelationsAsync(long userId)
        {
            var entity = await _context.Donors
                .Include(d => d.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(d => d.BloodType)
                .Include(d => d.DonorAvailabilities)
                .Include(d => d.DonorHealthConditions)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.UserId == userId);

            return entity == null ? null : MapToDomainWithRelations(entity);
        }

        public async Task<DonorDomain?> GetByIdWithAvailabilitiesAsync(long donorId)
        {
            var entity = await _context.Donors
                .Include(d => d.DonorAvailabilities)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DonorId == donorId);

            if (entity == null)
                return null;

            var availabilities = entity.DonorAvailabilities.Select(a =>
                Domain.Donors.Entities.DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin));

            var donor = DonorDomain.Rehydrate(
                id: entity.DonorId,
                userId: entity.UserId,
                bloodTypeId: entity.BloodTypeId,
                addressId: entity.AddressId,
                travelRadiusKm: entity.TravelRadiusKm,
                nextEligibleDate: entity.NextEligibleDate,
                isReady: entity.IsReady,
                lastKnownLocation: entity.Latitude.HasValue && entity.Longitude.HasValue
                    ? GeoLocation.Create(entity.Latitude.Value, entity.Longitude.Value)
                    : null,
                locationUpdatedAt: entity.LocationUpdatedAt,
                createdAt: entity.CreatedAt,
                updatedAt: entity.UpdatedAt);

            foreach (var availability in availabilities)
            {
                donor.AddAvailability(availability);
            }

            return donor;
        }

        public async Task<List<DonorDomain>> GetDonorsByBloodTypesAsync(IEnumerable<int> bloodTypeIds)
        {
            var ids = bloodTypeIds?.ToList() ?? new List<int>();
            if (!ids.Any())
                return new List<DonorDomain>();

            var donors = await _context.Donors
                .Include(d => d.BloodType)
                .AsNoTracking()
                .Where(d => d.BloodTypeId.HasValue && ids.Contains(d.BloodTypeId.Value))
                .ToListAsync();

            return donors.Select(MapToDomainWithRelations).ToList();
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
            // Map Availabilities
            var availabilities = entity.DonorAvailabilities.Select(a => 
                Domain.Donors.Entities.DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin)
            );
            
            // Map Health Conditions
            var healthConditions = entity.DonorHealthConditions.Select(hc => 
                Domain.Donors.Entities.DonorHealthConditionDomain.Create(entity.DonorId, hc.ConditionId)
            );
            
            var donor = DonorDomain.RehydrateWithRelations(
                id: entity.DonorId,
                userId: entity.UserId,
                bloodTypeId: entity.BloodTypeId,
                addressId: entity.AddressId,
                travelRadiusKm: entity.TravelRadiusKm,
                nextEligibleDate: entity.NextEligibleDate,
                isReady: entity.IsReady,
                lastKnownLocation: entity.Latitude.HasValue && entity.Longitude.HasValue
                    ? GeoLocation.Create(entity.Latitude.Value, entity.Longitude.Value)
                    : null,
                locationUpdatedAt: entity.LocationUpdatedAt,
                createdAt: entity.CreatedAt,
                updatedAt: entity.UpdatedAt,
                availabilities: availabilities,
                healthConditions: healthConditions
            );

            if (entity.User != null)
            {
                var email = new Domain.Users.ValueObjects.Email(entity.User.Email);
                var userDomain = Domain.Users.Entities.UserDomain.Rehydrate(
                    entity.User.UserId,
                    email,
                    entity.User.CognitoUserId,
                    entity.User.PhoneNumber,
                    entity.User.IsActive,
                    entity.User.CreatedAt
                );
                
                // Set Profile if exists
                if (entity.User.UserProfile != null)
                {
                    var profile = Domain.Users.Entities.UserProfileDomain.Rehydrate(
                        entity.User.UserProfile.UserId,
                        entity.User.UserProfile.FullName,
                        entity.User.UserProfile.BirthYear,
                        entity.User.UserProfile.Gender,
                        entity.User.UserProfile.PrivacyPhoneVisibleToStaffOnly
                    );
                    userDomain.GetType().GetProperty("Profile")?.SetValue(userDomain, profile);
                }
                
                donor.SetUser(userDomain);
            }

            if (entity.BloodType != null)
            {
                donor.SetBloodType(entity.BloodType.BloodTypeId, entity.BloodType.Abo, entity.BloodType.Rh);
            }

            return donor;
        }
    }
}
