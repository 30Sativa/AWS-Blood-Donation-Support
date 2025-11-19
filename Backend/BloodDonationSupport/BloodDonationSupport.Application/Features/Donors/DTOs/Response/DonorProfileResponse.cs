using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class DonorProfileResponse
    {
        public long DonorId { get; set; }
        public long UserId { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public string? BloodGroup { get; set; }
        public int? BloodTypeId { get; set; }

        public string? AddressDisplay { get; set; }
        public long? AddressId { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal TravelRadiusKm { get; set; }

        public DateOnly? NextEligibleDate { get; set; }
        public bool IsReady { get; set; }

        public List<DonorAvailabilityResponse> Availabilities { get; set; } = new();
        public List<DonorHealthConditionItemResponse> HealthConditions { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}
