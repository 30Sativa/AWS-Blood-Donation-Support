using BloodDonationSupport.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class DateTimeProvider : IDateTimeProvider
    {
        public DateOnly Today()
        => DateOnly.FromDateTime(DateTime.UtcNow);
    }
}
