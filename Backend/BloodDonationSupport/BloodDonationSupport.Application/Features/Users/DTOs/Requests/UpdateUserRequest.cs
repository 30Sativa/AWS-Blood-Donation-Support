namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class UpdateUserRequest
    {
        public long Id { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FullName { get; set; }
        public int? BirthYear { get; set; }
        public string? Gender { get; set; }
        public string? RoleCode { get; set; }
        public bool? IsActive { get; set; }
    }
}