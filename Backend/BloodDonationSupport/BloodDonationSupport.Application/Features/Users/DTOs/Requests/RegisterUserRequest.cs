using BloodDonationSupport.Domain.Users.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.DTOs.Requests
{
    public class RegisterUserRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? PhoneNumber { get; set; }
        public string FullName { get; set; } = default!; // Required theo schema user_profiles
    }
}
