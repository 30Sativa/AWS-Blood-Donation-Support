namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class UpdateMyProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
        public bool? PrivacyPhoneVisibleToStaffOnly { get; set; }
    }
}

