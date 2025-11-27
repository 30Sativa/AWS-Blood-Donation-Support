namespace BloodDonationSupport.Application.Features.Appointments.DTOs.Request
{
    public class CreateAppointmentRequest
    {
        public long RequestId { get; set; }
        public long DonorId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public long? LocationId { get; set; }
        public string Status { get; set; } = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    }
}