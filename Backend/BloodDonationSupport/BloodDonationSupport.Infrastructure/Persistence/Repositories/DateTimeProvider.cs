using BloodDonationSupport.Application.Common.Interfaces;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class DateTimeProvider : IDateTimeProvider
    {
        public DateOnly Today()
        => DateOnly.FromDateTime(DateTime.UtcNow);
    }
}