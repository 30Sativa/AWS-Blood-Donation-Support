using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateHealthConditionsRequest
    {
        public long DonorId { get; set; }
        public List<int> HealthConditionIds { get; set; } = new();
    }
}
