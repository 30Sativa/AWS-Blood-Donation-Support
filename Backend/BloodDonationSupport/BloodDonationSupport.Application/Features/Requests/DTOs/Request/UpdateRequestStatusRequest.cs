using BloodDonationSupport.Domain.Requests.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class UpdateRequestStatusRequest
    {
        public long RequestId { get; set; }
        public RequestStatus NewStatus { get; set; } 
    }
}
