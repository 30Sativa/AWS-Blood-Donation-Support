using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.DTOs.Response
{
    public class CompatibleDonorDto
    {
        public long DonorId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public double DistanceKm { get; set; }
        public string? LastKnownLocation { get; set; }
        public bool IsReady { get; set; }
    }
}
