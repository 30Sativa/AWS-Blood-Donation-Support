using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Donors.Rules
{
    public class DonorEligibilityRule : IBusinessRule
    {
        private readonly DateOnly? _nextEligibleDate;
        private readonly DateOnly _today;

        public DonorEligibilityRule(DateOnly? nextEligibleDate, DateOnly today)
        {
            _nextEligibleDate = nextEligibleDate;
            _today = today;
        }

        public string Message => "Donor is not yet eligible to donate blood again.";

        public bool IsBroken()
        {
            // Chưa hiến lần nào → luôn OK
            if (_nextEligibleDate is null)
                return false;

            // Chỉ block nếu ngày đủ điều kiện HIỆN TẠI < ngày phải chờ
            return _today < _nextEligibleDate.Value;
        }
    }
}