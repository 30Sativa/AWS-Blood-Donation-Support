using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Requests.Enums;
using BloodDonationSupport.Domain.Requests.Events;
using BloodDonationSupport.Domain.Requests.Rules;
using BloodDonationSupport.Domain.Shared.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;

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

        // 🟢 NEW: Location of request (needed for distance logic)
        public GeoLocation? Location { get; private set; }

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
        public void SetLocation(double latitude, double longitude)
        {
            CheckRule(new RequestMustHaveLocationRule(latitude, longitude));
            Location = GeoLocation.Create(latitude, longitude);
            UpdatedAt = DateTime.UtcNow;
        }

        public void StartMatching()
        {
            if (Status != RequestStatus.REQUESTED)
                throw new DomainException("Request must be in REQUESTED state to start matching.");

            Status = RequestStatus.MATCHING;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new RequestMatchingStartedEvent(Id));
        }

        public void Fulfill()
        {
            if (Status != RequestStatus.MATCHING)
                throw new DomainException("Request must be in MATCHING state to fulfill.");

            Status = RequestStatus.FULFILLED;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new RequestFulfilledEvent(Id));
        }

        public void Cancel(string reason)
        {
            if (Status == RequestStatus.FULFILLED)
                throw new DomainException("Cannot cancel a fulfilled request.");

            Status = RequestStatus.CANCELLED;
            UpdatedAt = DateTime.UtcNow;

            AddDomainEvent(new RequestCancelledEvent(Id, reason));
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
    DateTime? updatedAt,
    GeoLocation? location)
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
                UpdatedAt = updatedAt,
                Location = location
            };
        }
    }
}