using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class DonorHealthConditionItemResponse
    {
        public int ConditionId { get; set; }
        public string? ConditionName { get; set; }
    }
}
