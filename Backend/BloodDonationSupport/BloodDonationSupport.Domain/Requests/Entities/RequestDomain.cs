using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Requests.Enums;
using BloodDonationSupport.Domain.Requests.Events;
using BloodDonationSupport.Domain.Requests.Rules;
using BloodDonationSupport.Domain.Shared.Entities;

namespace BloodDonationSupport.Domain.Requests.Entities
{
    public class RequestDomain : AggregateRoot<long>
    {
        public long RequesterUserId { get; private set; }
        public UrgencyLevel Urgency { get; private set; }
        public int BloodTypeId { get; private set; }
        public int ComponentId { get; private set; }
        public int QuantityUnits { get; private set; }
        public DateTime? NeedBeforeUtc { get; private set; }
        public long? DeliveryAddressId { get; private set; }
        public RequestStatus Status { get; private set; }
        public string? ClinicalNotes { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        // Navigation (optional)
        public BloodType? BloodType { get; private set; }

        private RequestDomain()
        { } // EF

        private RequestDomain(
            long requesterUserId,
            UrgencyLevel urgency,
            int bloodTypeId,
            int componentId,
            int quantityUnits,
            DateTime? needBeforeUtc,
            long? deliveryAddressId,
            string? clinicalNotes)
        {
            CheckRule(new RequestMustHaveValidQuantityRule(quantityUnits));

            RequesterUserId = requesterUserId;
            Urgency = urgency;
            BloodTypeId = bloodTypeId;
            ComponentId = componentId;
            QuantityUnits = quantityUnits;
            NeedBeforeUtc = needBeforeUtc;
            DeliveryAddressId = deliveryAddressId;
            Status = RequestStatus.REQUESTED;
            ClinicalNotes = clinicalNotes;
            CreatedAt = DateTime.UtcNow;

            AddDomainEvent(new RequestCreatedEvent(Id, requesterUserId));
        }

        public static RequestDomain Create(
            long requesterUserId,
            UrgencyLevel urgency,
            int bloodTypeId,
            int componentId,
            int quantityUnits,
            DateTime? needBeforeUtc,
            long? deliveryAddressId,
            string? clinicalNotes)
        {
            return new RequestDomain(
                requesterUserId,
                urgency,
                bloodTypeId,
                componentId,
                quantityUnits,
                needBeforeUtc,
                deliveryAddressId,
                clinicalNotes);
        }

        // ========= Behavior =========
        public void UpdateStatus(RequestStatus status)
        {
            Status = status;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new RequestStatusChangedEvent(Id, status));
        }

        public void UpdateClinicalNotes(string? notes)
        {
            ClinicalNotes = notes;
            UpdatedAt = DateTime.UtcNow;
        }

        public static RequestDomain Rehydrate(
    long id,
    long requesterUserId,
    UrgencyLevel urgency,
    int bloodTypeId,
    int componentId,
    int quantityUnits,
    DateTime? needBeforeUtc,
    long? deliveryAddressId,
    RequestStatus status,
    string? clinicalNotes,
    DateTime createdAt,
    DateTime? updatedAt)
        {
            return new RequestDomain
            {
                Id = id,
                RequesterUserId = requesterUserId,
                Urgency = urgency,
                BloodTypeId = bloodTypeId,
                ComponentId = componentId,
                QuantityUnits = quantityUnits,
                NeedBeforeUtc = needBeforeUtc,
                DeliveryAddressId = deliveryAddressId,
                Status = status,
                ClinicalNotes = clinicalNotes,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };
        }
    }
}