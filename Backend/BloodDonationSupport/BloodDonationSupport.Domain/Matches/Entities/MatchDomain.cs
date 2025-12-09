using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Matches.Events;
using BloodDonationSupport.Domain.Matches.Rules;

namespace BloodDonationSupport.Domain.Matches.Entities
{
    public class MatchDomain : AggregateRoot<long>
    {
        public long RequestId { get; private set; }
        public long DonorId { get; private set; }
        public decimal? CompatibilityScore { get; private set; }
        public decimal DistanceKm { get; private set; }

        public string Status { get; private set; } = MatchStatus.PROPOSED;
        public DateTime? ContactedAt { get; private set; }
        public string? Response { get; private set; }
        public DateTime CreatedAt { get; private set; }

        private MatchDomain() { } // EF

        private MatchDomain(long requestId, long donorId, decimal? score, decimal distanceKm)
        {
            RequestId = requestId;
            DonorId = donorId;
            CompatibilityScore = score;
            DistanceKm = distanceKm;
            Status = MatchStatus.PROPOSED;
            CreatedAt = DateTime.UtcNow;
        }

        public static MatchDomain Create(long requestId, long donorId, decimal? score, decimal distanceKm)
            => new MatchDomain(requestId, donorId, score, distanceKm);

        // ================== BEHAVIORS ==================

        public void MarkContacted()
        {
            CheckRule(new MatchCanBeContactedRule(Status));

            Status = MatchStatus.CONTACTED;
            ContactedAt = DateTime.UtcNow;

            AddDomainEvent(new MatchContactedEvent(Id, DonorId, RequestId));
            MarkUpdated();
        }

        public void Accept()
        {
            CheckRule(new MatchCanBeAcceptedRule(Status));

            Status = MatchStatus.ACCEPTED;
            Response = "ACCEPT";

            AddDomainEvent(new MatchAcceptedEvent(Id, DonorId, RequestId));

            MarkUpdated();
        }

        public void Decline()
        {
            CheckRule(new MatchCanBeDeclinedRule(Status));

            Status = MatchStatus.DECLINED;
            Response = "DECLINE";

            AddDomainEvent(new MatchDeclinedEvent(Id, DonorId, RequestId));

            MarkUpdated();
        }

        public void MarkNoAnswer()
        {
            if (Status != MatchStatus.CONTACTED)
                throw new DomainException("Can only mark no-answer after contact.");

            Status = MatchStatus.NO_ANSWER;
            Response = "NO_ANSWER";

            AddDomainEvent(new MatchNoAnswerEvent(Id, DonorId, RequestId));

            MarkUpdated();
        }

        // ================= REHYDRATE ===================

        public static MatchDomain Rehydrate(
            long id, long requestId, long donorId,
            decimal? score, decimal distanceKm,
            string status, DateTime? contactedAt, string? response,
            DateTime createdAt)
        {
            return new MatchDomain
            {
                Id = id,
                RequestId = requestId,
                DonorId = donorId,
                CompatibilityScore = score,
                DistanceKm = distanceKm,
                Status = status,
                ContactedAt = contactedAt,
                Response = response,
                CreatedAt = createdAt
            };
        }
    }
}
