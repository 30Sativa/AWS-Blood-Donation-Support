using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Donors.Events;
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
        public DateOnly? NextEligibleDate { get; private set; }         // null = chưa từng hiến máu
        public bool IsReady { get; private set; }                       // donor mới tạo luôn false
        public GeoLocation? LastKnownLocation { get; private set; }
        public DateTime? LocationUpdatedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public string? AddressDisplay { get; private set; }
        public UserProfileDomain? Profile { get; private set; }
        // Navigation
        public UserDomain? User { get; private set; }

        public BloodType? BloodType { get; private set; }

        public IReadOnlyCollection<DonorAvailability> Availabilities => _availabilities.AsReadOnly();
        public IReadOnlyCollection<DonorHealthConditionDomain> HealthConditions => _healthConditions.AsReadOnly();

        private DonorDomain()
        { }   // EF Core bắt buộc

        // Constructor dùng khi tạo mới Donor
        private DonorDomain(long userId, decimal travelRadiusKm)
        {
            UserId = userId;
            TravelRadiusKm = travelRadiusKm;
            IsReady = false;
            NextEligibleDate = null;  // ← người mới chưa hiến máu lần nào

            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;

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

        // ❗Không kiểm tra Eligibility trong Domain
        // Eligibility sẽ được kiểm tra ở Application Handler
        public void MarkReady(bool ready)
        {
            IsReady = ready;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new DonorStatusUpdatedEvent(Id, ready));
        }

        public void UpdateEligibility(DateOnly? nextEligibleDate)
        {
            NextEligibleDate = nextEligibleDate; // null = allow first donation
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

        // Rehydrate (load từ DB)
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
            var donor = Rehydrate(id, userId, bloodTypeId, addressId, travelRadiusKm,
                                  nextEligibleDate, isReady, lastKnownLocation,
                                  locationUpdatedAt, createdAt, updatedAt);

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

        public void SetProfile(UserProfileDomain profile)
        {
            Profile = profile;
        }

        public void SetBloodType(int? bloodTypeId, string? abo, string? rh)
        {
            BloodTypeId = bloodTypeId;
            BloodType = new BloodType(abo ?? "?", rh ?? "?");
        }
    }
}