namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class ConfirmEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string ConfirmationCode { get; set; } = string.Empty;
    }
}