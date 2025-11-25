using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Request
{
    public class UpdateMyAddressRequest 
    {
        public string FullAddress { get; set; } = string.Empty;
    }
}
