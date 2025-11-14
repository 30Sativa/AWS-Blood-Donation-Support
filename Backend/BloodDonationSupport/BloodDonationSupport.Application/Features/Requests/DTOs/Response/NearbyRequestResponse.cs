using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class NearbyRequestResponse
    {
        public long RequestId { get; set; }
        public long RequesterUserId { get; set; }
        public string? FullName { get; set; }
        public string? BloodGroup { get; set; }
        public string? Component { get; set; } 
        public string? AddressDisplay { get; set; }
        public string Urgency { get; set; } = "NORMAL";
        public string Status { get; set; } = "REQUESTED";
        public int QuantityUnits { get; set; }        
        public DateTime? NeedBeforeUtc { get; set; }  
        public DateTime CreatedAt { get; set; }       
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double DistanceKm { get; set; }
    }
}
