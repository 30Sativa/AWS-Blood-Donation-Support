namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class Request
{
    public long RequestId { get; set; }

    public long RequesterUserId { get; set; }

    public string Urgency { get; set; } = null!;

    public int BloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public int QuantityUnits { get; set; }

    public DateTime? NeedBeforeUtc { get; set; }

    public long? DeliveryAddressId { get; set; }

    public string Status { get; set; } = null!;

    public string? ClinicalNotes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public double? Latitude { get; set; }  
    public double? Longitude { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual BloodType BloodType { get; set; } = null!;

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual Address? DeliveryAddress { get; set; }

    public virtual ICollection<InventoryUnit> InventoryUnits { get; set; } = new List<InventoryUnit>();

    public virtual ICollection<Match> Matches { get; set; } = new List<Match>();

    public virtual ICollection<RequestEvent> RequestEvents { get; set; } = new List<RequestEvent>();

    public virtual User RequesterUser { get; set; } = null!;
}