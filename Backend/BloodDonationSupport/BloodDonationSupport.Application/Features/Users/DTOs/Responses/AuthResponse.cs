using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class AuthResponse
    {
        public long Id { get; set; }
        public string Email { get; set; } = default!;
        public string Fullname { get; set; } = default!;
        public string CognitoUserId { get; set; } = default!;

    }
}
