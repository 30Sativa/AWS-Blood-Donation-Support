namespace BloodDonationSupport.Application.Features.Appointments.DTOs.Response
{
    public class AppointmentData
    {
        public long? AppointmentId { get; set; }
        public long RequestId { get; set; }
        public long DonorId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public long? LocationId { get; set; }
        public string Status { get; set; } = "SCHEDULED";
        public long CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


