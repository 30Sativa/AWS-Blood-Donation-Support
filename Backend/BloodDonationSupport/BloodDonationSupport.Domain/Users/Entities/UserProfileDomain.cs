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
        public int? BirthYear { get; private set; } // Thay DateOfBirth bằng BirthYear theo schema
        public string? Gender { get; private set; }
        public bool PrivacyPhoneVisibleToStaffOnly { get; private set; } = true; // Default true theo schema

        // Navigation
        public UserDomain User { get; private set; } = null!;

        private UserProfileDomain() { } // For EF Core

        private UserProfileDomain(long userId, string fullName, int? birthYear, string? gender, bool privacyPhoneVisibleToStaffOnly)
        {
            UserId = userId;
            FullName = fullName;
            BirthYear = birthYear;
            Gender = gender;
            PrivacyPhoneVisibleToStaffOnly = privacyPhoneVisibleToStaffOnly;
        }

        public static UserProfileDomain Create(long userId, string fullName, int? birthYear = null, string? gender = null, bool privacyPhoneVisibleToStaffOnly = true)
        {
            return new UserProfileDomain(userId, fullName, birthYear, gender, privacyPhoneVisibleToStaffOnly);
        }

        public void UpdateProfile(string fullName, int? birthYear = null, string? gender = null, bool? privacyPhoneVisibleToStaffOnly = null)
        {
            FullName = fullName;
            if (birthYear.HasValue)
                BirthYear = birthYear;
            if (gender != null)
                Gender = gender;
            if (privacyPhoneVisibleToStaffOnly.HasValue)
                PrivacyPhoneVisibleToStaffOnly = privacyPhoneVisibleToStaffOnly.Value;
        }
    }
}
