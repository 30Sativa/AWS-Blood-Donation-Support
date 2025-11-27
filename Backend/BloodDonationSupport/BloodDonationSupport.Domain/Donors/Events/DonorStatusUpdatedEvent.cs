using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Donors.Events
{
    public sealed class DonorStatusUpdatedEvent : IDomainEvent
    {
        public long DonorId { get; }
        public bool IsReady { get; }
        public DateTime UpdatedAt { get; }
        public DateTime OccurredOn => UpdatedAt;

        public DonorStatusUpdatedEvent(long donorId, bool isReady)
        {
            DonorId = donorId;
            IsReady = isReady;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}