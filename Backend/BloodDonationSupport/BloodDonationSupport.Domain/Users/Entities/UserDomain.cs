using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; private set; } = true;

        public List<string> Roles { get; private set; } = new List<string>();
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public UserDomain() { } // EF constructor
        private UserDomain(Email email, string cognitoUserId, string phoneNumber)
        {
            Email = email;
            CognitoUserId = cognitoUserId;
            PhoneNumber = phoneNumber;

            AddDomainEvent(new UserRegisteredEvent(email.Value, cognitoUserId));
        }
        // Private constructor for rehydration with roles
        private UserDomain(
    long id,
    Email email,
    string cognitoUserId,
    string? phoneNumber,
    bool isActive,
    DateTime createdAt)
        {
            Id = id;
            Email = email;
            CognitoUserId = cognitoUserId;
            PhoneNumber = phoneNumber;
            IsActive = isActive;
            CreateAt = createdAt;
        }


        //Factory method: tạo user hợp lệ trong Domain
        public static UserDomain RegisterNewUser(Email email, string cognitoUserId, bool emailExists, string? phone = null)
        {
            UniqueEmailRule.Check(emailExists);
            return new UserDomain(email, cognitoUserId, phone);
        }

        //Rehydration method: tái tạo user từ dữ liệu lưu trữ
        public static UserDomain Rehydrate(long userId, Email email, string cognitoUserId, string? phoneNumber, bool isActive, DateTime createdAt)
        {
            var user = new UserDomain
            {
                Id = userId,
                Email = email,
                CognitoUserId = cognitoUserId,
                PhoneNumber = phoneNumber,
                IsActive = isActive,
                CreateAt = createdAt

            };
            return user;
        }

        public static UserDomain RehydrateWithRoles(
                long userId,
                Email email,
            string cognitoUserId,
                string? phoneNumber,
                bool isActive,
            DateTime createdAt,
             List<string> roles)
        {
            var user = new UserDomain(userId, email, cognitoUserId, phoneNumber, isActive, createdAt);

            // Nếu Roles có private setter, ta dùng AddRange hoặc method nội bộ thay vì gán thẳng
            user.Roles.AddRange(roles);

            return user;
        }


        public void Deactivate()
        {
            IsActive = false;
        }


    }
}
