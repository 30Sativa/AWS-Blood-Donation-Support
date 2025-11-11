using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateReadyStatusRequest
    {
        public long DonorId { get; set; }
        public bool IsReady { get; set; }
    }
}
