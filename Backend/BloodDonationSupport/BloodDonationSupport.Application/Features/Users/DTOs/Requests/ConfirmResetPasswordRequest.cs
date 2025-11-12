namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class ConfirmResetPasswordRequest
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmationCode { get; set; }
    }
}