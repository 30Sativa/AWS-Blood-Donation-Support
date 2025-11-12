using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Shared.ValueObjects;

namespace BloodDonationSupport.Domain.Donors.Events
{
    public sealed class DonorLocationUpdatedEvent : IDomainEvent
    {
        public long DonorId { get; }
        public GeoLocation Location { get; }
        public DateTime UpdatedAt { get; }

        public DateTime OccurredOn => UpdatedAt;

        public DonorLocationUpdatedEvent(long donorId, GeoLocation location)
        {
            DonorId = donorId;
            Location = location;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}