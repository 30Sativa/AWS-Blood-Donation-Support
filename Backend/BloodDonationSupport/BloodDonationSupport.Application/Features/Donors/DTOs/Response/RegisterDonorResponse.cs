using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.DTOs.Response
{
    public class RegisterDonorResponse
    {
        public long DonorId { get; set; }
        public long UserId { get; set; }
        public int? BloodTypeId { get; set; }
        public long? AddressId { get; set; }

        public decimal TravelRadiusKm { get; set; }
        public bool IsReady { get; set; }
        public DateOnly? NextEligibleDate { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<AvailabilityItem>? Availabilities { get; set; }
        public List<HealthConditionItem>? HealthConditions { get; set; }
    }

    public class AvailabilityItem
    {
        public byte Weekday { get; set; }
        public short TimeFromMin { get; set; }
        public short TimeToMin { get; set; }
    }

    public class HealthConditionItem
    {
        public int ConditionId { get; set; }
        public string? ConditionName { get; set; }
    }
}
