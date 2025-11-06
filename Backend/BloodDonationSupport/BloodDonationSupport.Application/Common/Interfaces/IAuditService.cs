using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAuditService
    {
        Task LogAsync(
            long? userId,
            string action,
            string entityType,
            string? entityId,
            string? oldValue,
            string? newValue,
            string? detailsJson,
            string? ipAddress);
    }
}
