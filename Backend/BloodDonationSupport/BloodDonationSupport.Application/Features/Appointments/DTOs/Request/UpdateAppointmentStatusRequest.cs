using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Appointments.DTOs.Request
{
    public class UpdateAppointmentStatusRequest
    {
        public string Status { get; set; } = null!;
    }
}
