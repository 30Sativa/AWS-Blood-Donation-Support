using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Donors.Events;
using BloodDonationSupport.Domain.Donors.Rules;
using BloodDonationSupport.Domain.Shared.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using BloodDonationSupport.Domain.Users.Entities;

namespace BloodDonationSupport.Domain.Donors.Entities
{
    public class DonorDomain : AggregateRoot<long>
    {
        private readonly List<DonorAvailability> _availabilities = new();
        private readonly List<DonorHealthConditionDomain> _healthConditions = new();

        public long UserId { get; private set; }
        public int? BloodTypeId { get; private set; }
        public long? AddressId { get; private set; }
        public decimal TravelRadiusKm { get; private set; } = 10;
        public DateOnly? NextEligibleDate { get; private set; }
        public bool IsReady { get; private set; }
        public GeoLocation? LastKnownLocation { get; private set; }
        public DateTime? LocationUpdatedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public string? AddressDisplay { get; private set; }

        // ✅Navigation Properties
        public UserDomain? User { get; private set; }

        public BloodType? BloodType { get; private set; }

        // ✅Navigation domain collections
        public IReadOnlyCollection<DonorAvailability> Availabilities => _availabilities.AsReadOnly();

        public IReadOnlyCollection<DonorHealthConditionDomain> HealthConditions => _healthConditions.AsReadOnly();

        private DonorDomain()
        { } // EF cần constructor rỗng

        // Constructor gốc khi khởi tạo domain mới
        private DonorDomain(long userId, decimal travelRadiusKm)
        {
            UserId = userId;
            TravelRadiusKm = travelRadiusKm;
            IsReady = false;
            CreatedAt = DateTime.UtcNow;

            // Phát domain event khi tạo donor mới
            AddDomainEvent(new DonorRegisteredEvent(Id, userId));
        }

        public static DonorDomain Create(long userId, decimal travelRadiusKm = 10)
            => new DonorDomain(userId, travelRadiusKm);

        // ========= Behavior methods =========
        public void SetBloodType(int bloodTypeId)
        {
            BloodTypeId = bloodTypeId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetAddress(long addressId)
        {
            AddressId = addressId;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetAddressDisplay(string? addressDisplay)
        {
            AddressDisplay = addressDisplay;
        }

        public void MarkReady(bool ready)
        {
            //  Kiểm tra quy tắc nghiệp vụ: chỉ cho phép bật "Ready" nếu đủ điều kiện hiến máu
            if (ready)
            {
                CheckRule(new DonorEligibilityRule(NextEligibleDate));
            }

            IsReady = ready;
            UpdatedAt = DateTime.UtcNow;

            //  Phát Domain Event khi thay đổi trạng thái sẵn sàng
            AddDomainEvent(new DonorStatusUpdatedEvent(Id, ready));
        }

        public void UpdateEligibility(DateOnly? nextEligibleDate)
        {
            NextEligibleDate = nextEligibleDate;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateTravelRadius(decimal travelRadiusKm)
        {
            if (travelRadiusKm < 0)
                throw new DomainException("Travel radius cannot be negative.");
            TravelRadiusKm = travelRadiusKm;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateLocation(GeoLocation location)
        {
            LastKnownLocation = location;
            LocationUpdatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;

            //  Phát Domain Event khi cập nhật vị trí
            AddDomainEvent(new DonorLocationUpdatedEvent(Id, location));
        }

        public void AddAvailability(DonorAvailability availability)
        {
            if (!_availabilities.Any(a =>
                a.Weekday == availability.Weekday &&
                a.TimeFromMin == availability.TimeFromMin &&
                a.TimeToMin == availability.TimeToMin))
            {
                _availabilities.Add(availability);
            }
        }

        public void ClearAvailabilities() => _availabilities.Clear();

        public void AddHealthCondition(DonorHealthConditionDomain condition)
        {
            if (!_healthConditions.Any(c => c.ConditionId == condition.ConditionId))
                _healthConditions.Add(condition);
        }

        public void ClearHealthConditions() => _healthConditions.Clear();

        //  Factory (Rehydrate) – khi load từ DB
        public static DonorDomain Rehydrate(
            long id,
            long userId,
            int? bloodTypeId,
            long? addressId,
            decimal travelRadiusKm,
            DateOnly? nextEligibleDate,
            bool isReady,
            GeoLocation? lastKnownLocation,
            DateTime? locationUpdatedAt,
            DateTime createdAt,
            DateTime? updatedAt)
        {
            return new DonorDomain
            {
                Id = id,
                UserId = userId,
                BloodTypeId = bloodTypeId,
                AddressId = addressId,
                TravelRadiusKm = travelRadiusKm,
                NextEligibleDate = nextEligibleDate,
                IsReady = isReady,
                LastKnownLocation = lastKnownLocation,
                LocationUpdatedAt = locationUpdatedAt,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }

        // Factory (Rehydrate kèm navigation)
        public static DonorDomain RehydrateWithRelations(
            long id,
            long userId,
            int? bloodTypeId,
            long? addressId,
            decimal travelRadiusKm,
            DateOnly? nextEligibleDate,
            bool isReady,
            GeoLocation? lastKnownLocation,
            DateTime? locationUpdatedAt,
            DateTime createdAt,
            DateTime? updatedAt,
            IEnumerable<DonorAvailability> availabilities,
            IEnumerable<DonorHealthConditionDomain> healthConditions)
        {
            var donor = Rehydrate(id, userId, bloodTypeId, addressId, travelRadiusKm, nextEligibleDate, isReady,
                                  lastKnownLocation, locationUpdatedAt, createdAt, updatedAt);

            foreach (var a in availabilities)
                donor.AddAvailability(a);

            foreach (var h in healthConditions)
                donor.AddHealthCondition(h);

            return donor;
        }

        public void SetUser(UserDomain user)
        {
            User = user;
        }

        public void SetBloodType(int? bloodTypeId, string? abo, string? rh)
        {
            BloodTypeId = bloodTypeId;
            BloodType = new BloodType(abo ?? "?", rh ?? "?");
        }
    }
}