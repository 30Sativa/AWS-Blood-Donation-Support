using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class NearbyDonorResponse
    {
        public long DonorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string? AddressDisplay { get; set; }
        public bool IsReady { get; set; }
        public DateOnly? NextEligibleDate { get; set; }
        public double DistanceKm { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
