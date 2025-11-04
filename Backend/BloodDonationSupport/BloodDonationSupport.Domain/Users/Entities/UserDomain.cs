using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Users.Events;
using BloodDonationSupport.Domain.Users.Rules;
using BloodDonationSupport.Domain.Users.ValueObjects;

namespace BloodDonationSupport.Domain.Users.Entities
{
    public class UserDomain : AggregateRoot<long>
    {
        public Email Email { get; private set; } = default!;
        public string CognitoUserId { get; private set; } = default!;
        public string? PhoneNumber { get; private set; }
        public bool IsActive { get; private set; } = true;
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public IReadOnlyCollection<string> Roles => _roles.AsReadOnly();
        private readonly List<string> _roles = new();

        private UserDomain() { } // For EF Core

        private UserDomain(Email email, string cognitoUserId, string? phone)
        {
            Email = email;
            CognitoUserId = cognitoUserId;
            PhoneNumber = phone;

            AddDomainEvent(new UserRegisteredEvent(email.Value, cognitoUserId));
        }

        private UserDomain(long id, Email email, string cognitoUserId, string? phone, bool isActive, DateTime createdAt)
        {
            Id = id;
            Email = email;
            CognitoUserId = cognitoUserId;
            PhoneNumber = phone;
            IsActive = isActive;
            CreatedAt = createdAt;
        }

        public static UserDomain RegisterNewUser(Email email, string cognitoUserId, bool emailExists, string? phone = null)
        {
            UniqueEmailRule.Check(emailExists);
            return new UserDomain(email, cognitoUserId, phone);
        }

        public static UserDomain Rehydrate(long userId, Email email, string cognitoUserId, string? phoneNumber, bool isActive, DateTime createdAt)
        {
            return new UserDomain(userId, email, cognitoUserId, phoneNumber, isActive, createdAt);
        }

        public static UserDomain RehydrateWithRoles(
            long userId, Email email, string cognitoUserId,
            string? phoneNumber, bool isActive, DateTime createdAt, IEnumerable<string> roles)
        {
            var user = new UserDomain(userId, email, cognitoUserId, phoneNumber, isActive, createdAt);
            user._roles.AddRange(roles);
            return user;
        }

        public void Deactivate() => IsActive = false;

        public void UpdatePhone(string? phone)
        {
            PhoneNumber = phone;
        }
    }
}
