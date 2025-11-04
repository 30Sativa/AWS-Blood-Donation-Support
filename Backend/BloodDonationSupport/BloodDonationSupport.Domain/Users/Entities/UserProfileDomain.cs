using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.Entities
{
    public class UserProfileDomain : BaseEntity<long>
    {
        public long UserId { get; private set; }
        public string FullName { get; private set; } = null!;
        public int? BirthYear { get; private set; }
        public string? Gender { get; private set; }
        public bool PrivacyPhoneVisibleToStaffOnly { get; private set; } = true;

        private UserProfileDomain() { } // For EF Core

        private UserProfileDomain(long userId, string fullName, int? birthYear, string? gender, bool privacyPhoneVisibleToStaffOnly)
        {
            UserId = userId;
            FullName = fullName;
            BirthYear = birthYear;
            Gender = gender;
            PrivacyPhoneVisibleToStaffOnly = privacyPhoneVisibleToStaffOnly;
        }

        //  Factory khi tạo mới trong code (Application -> Domain)
        public static UserProfileDomain Create(
            long userId,
            string fullName,
            int? birthYear = null,
            string? gender = null,
            bool privacyPhoneVisibleToStaffOnly = true)
        {
            return new UserProfileDomain(userId, fullName, birthYear, gender, privacyPhoneVisibleToStaffOnly);
        }

        //  Factory khi load từ DB (Infrastructure -> Domain)
        public static UserProfileDomain Rehydrate(
            long userId,
            string fullName,
            int? birthYear,
            string? gender,
            bool privacyPhoneVisibleToStaffOnly)
        {
            return new UserProfileDomain(userId, fullName, birthYear, gender, privacyPhoneVisibleToStaffOnly);
        }

        //  Cập nhật Profile
        public void UpdateProfile(string fullName, int? birthYear = null, string? gender = null, bool? privacyPhoneVisibleToStaffOnly = null)
        {
            if (!string.IsNullOrWhiteSpace(fullName))
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
