namespace BloodDonationSupport.Application.Features.Appointments.DTOs.Request
{
    public class CreateAppointmentRequest
    {
        public long RequestId { get; set; }

        public long DonorId { get; set; }

        public long? LocationId { get; set; }

        public DateTime ScheduledAt { get; set; }

        public string? Notes { get; set; }

        public long CreatedBy { get; set; }
    }
}