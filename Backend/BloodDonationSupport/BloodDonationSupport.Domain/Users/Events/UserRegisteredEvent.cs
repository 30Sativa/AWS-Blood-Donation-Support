using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.Events
{
    public class UserRegisteredEvent : IDomainEvent
    {
        public string Email { get; }
        public string CognitoUserId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;

        public UserRegisteredEvent(string email, string cognitoUserId)
        {
            Email = email;
            CognitoUserId = cognitoUserId;
        }
    }
}