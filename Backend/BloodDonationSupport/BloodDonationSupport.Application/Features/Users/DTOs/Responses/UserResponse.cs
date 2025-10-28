using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class UserResponse
    {
        public long Id { get; set; }
        public string Email { get; set; } = default!;
        public string CognitoUserId { get; set; } = default!;
    }
}
