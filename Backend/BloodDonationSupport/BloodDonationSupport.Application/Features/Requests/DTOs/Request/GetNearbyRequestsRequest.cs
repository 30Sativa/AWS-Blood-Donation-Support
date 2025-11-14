using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Request
{
    public class GetNearbyRequestsRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double RadiusKm { get; set; } = 10;
    }
}
