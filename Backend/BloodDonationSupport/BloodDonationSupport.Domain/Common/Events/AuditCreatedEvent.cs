using BloodDonationSupport.Domain.Common.Entites;
using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
