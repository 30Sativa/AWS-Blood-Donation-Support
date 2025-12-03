using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Appointments.Entities
{
    public class AppointmentDomain : AggregateRoot<long>
    {
        public long RequestId { get; private set; }
        public long DonorId { get; private set; }
        public long? LocationId { get; private set; }
        public DateTime ScheduledAt { get; private set; }
        public string? Notes { get; private set; }
        public string Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public long CreatedBy { get; private set; }

        private AppointmentDomain() { }

        private AppointmentDomain(
            long requestId,
            long donorId,
            long? locationId,
            DateTime scheduledAt,
            string? notes,
            long createdBy)
        {
            RequestId = requestId;
            DonorId = donorId;
            LocationId = locationId;
            ScheduledAt = scheduledAt;
            Notes = notes;
            CreatedBy = createdBy;
            CreatedAt = DateTime.UtcNow;
            Status = AppointmentStatus.SCHEDULED;
        }

        public static AppointmentDomain Create(
            long requestId,
            long donorId,
            long? locationId,
            DateTime scheduledAt,
            string? notes,
            long createdBy)
            => new AppointmentDomain(requestId, donorId, locationId, scheduledAt, notes, createdBy);

        public void MarkCheckedIn()
        {
            Status = AppointmentStatus.CHECKED_IN;
            MarkUpdated();
        }

        public void MarkCancelled()
        {
            Status = AppointmentStatus.CANCELLED;
            MarkUpdated();
        }

        public void MarkNoShow()
        {
            Status = AppointmentStatus.NO_SHOW;
            MarkUpdated();
        }

        public static AppointmentDomain Rehydrate(
            long id,
            long requestId,
            long donorId,
            long? locationId,
            DateTime scheduledAt,
            string? notes,
            string status,
            DateTime createdAt,
            long createdBy)
        {
            return new AppointmentDomain
            {
                Id = id,
                RequestId = requestId,
                DonorId = donorId,
                LocationId = locationId,
                ScheduledAt = scheduledAt,
                Notes = notes,
                Status = status,
                CreatedAt = createdAt,
                CreatedBy = createdBy
            };
        }
    }

    public static class AppointmentStatus
    {
        public const string SCHEDULED = "SCHEDULED";
        public const string CHECKED_IN = "CHECKED_IN";
        public const string NO_SHOW = "NO_SHOW";
        public const string CANCELLED = "CANCELLED";
    }

}
