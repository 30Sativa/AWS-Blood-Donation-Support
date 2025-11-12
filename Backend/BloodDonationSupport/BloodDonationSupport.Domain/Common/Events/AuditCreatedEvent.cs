using BloodDonationSupport.Domain.Common.Entites;

namespace BloodDonationSupport.Domain.Common.Events
{
    public class AuditCreatedEvent : IDomainEvent
    {
        public AuditLog Log { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public AuditCreatedEvent(AuditLog log)
        {
            Log = log;
        }
    }
}