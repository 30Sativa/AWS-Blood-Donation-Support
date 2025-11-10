namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Address
{
    public long AddressId { get; set; }

    public string? Line1 { get; set; }

    public string? District { get; set; }

    public string? City { get; set; }

    public string? Province { get; set; }

    public string? Country { get; set; }

    public string? PostalCode { get; set; }

    public string? NormalizedAddress { get; set; }

    public string? PlaceId { get; set; }

    public decimal? ConfidenceScore { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<Donor> Donors { get; set; } = new List<Donor>();

    public virtual ICollection<HealthcareFacility> HealthcareFacilities { get; set; } = new List<HealthcareFacility>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();
}