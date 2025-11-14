using System;

namespace BloodDonationSupport.Application.Features.Users.DTOs.Responses
{
    public class AuditLogResponse
    {
        public long AuditId { get; set; }
        public long? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? DetailsJson { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

