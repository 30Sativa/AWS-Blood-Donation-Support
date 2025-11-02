using System;
using System.Collections.Generic;

namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class User
{
    public long UserId { get; set; }

    public string Email { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public byte[]? PasswordHash { get; set; }

    public bool IsActive { get; set; }

    public string? CognitoUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();

    public virtual Donor? Donor { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<QcTest> QcTests { get; set; } = new List<QcTest>();

    public virtual ICollection<RequestEvent> RequestEvents { get; set; } = new List<RequestEvent>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<S3Attachment> S3Attachments { get; set; } = new List<S3Attachment>();

    public virtual UserProfile? UserProfile { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();

}
