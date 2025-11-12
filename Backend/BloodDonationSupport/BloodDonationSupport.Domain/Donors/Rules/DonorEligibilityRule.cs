using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Donors.Rules
{
    public class DonorEligibilityRule : IBusinessRule
    {
        private readonly DateOnly? _nextEligibleDate;

        public DonorEligibilityRule(DateOnly? nextEligibleDate)
        {
            _nextEligibleDate = nextEligibleDate;
        }

        public string Message => "Donor is not yet eligible to donate blood again.";

        public bool IsBroken()
        {
            if (_nextEligibleDate is null)
                return false; // chưa có ngày cụ thể → OK

            return _nextEligibleDate > DateOnly.FromDateTime(DateTime.UtcNow);
        }
    }
}