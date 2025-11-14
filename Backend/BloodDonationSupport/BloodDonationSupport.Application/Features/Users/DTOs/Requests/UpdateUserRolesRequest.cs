namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class UpdateUserRolesRequest
    {
        public IList<string> RoleCodes { get; set; } = new List<string>();
    }
}

