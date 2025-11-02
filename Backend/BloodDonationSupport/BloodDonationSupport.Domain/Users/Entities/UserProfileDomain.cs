using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Users.Entities
{
    public class UserProfileDomain : BaseEntity<long>
    {
        public long UserId { get; private set; }
        public string FullName { get; private set; } = null!;
        public DateTime? DateOfBirth { get; private set; }
        public string? Address { get; private set; }
        public string? Gender { get; private set; }

        // Navigation
        public UserDomain User { get; private set; } = null!;

        private UserProfileDomain() { } // For EF Core

        private UserProfileDomain(long userId, string fullName, DateTime? dob, string? gender, string? address)
        {
            UserId = userId;
            FullName = fullName;
            DateOfBirth = dob;
            Gender = gender;
            Address = address;
        }

        public static UserProfileDomain Create(long userId, string fullName, DateTime? dob, string? gender, string? address)
        {
            return new UserProfileDomain(userId, fullName, dob, gender, address);
        }

        public void UpdateProfile(string fullName, DateTime? dob, string? gender, string? address)
        {
            FullName = fullName;
            DateOfBirth = dob;
            Gender = gender;
            Address = address;
        }
    }
}
