using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Donors.Events
{
    public sealed class DonorRegisteredEvent : IDomainEvent
    {
        public long DonorId { get; }
        public long UserId { get; }
        public DateTime RegisteredAt { get; }

        public DateTime OccurredOn => RegisteredAt;

        public DonorRegisteredEvent(long donorId, long userId)
        {
            DonorId = donorId;
            UserId = userId;
            RegisteredAt = DateTime.UtcNow;
        }
    }
}
