using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Requests.Rules
{
    public class RequestMustHaveValidQuantityRule : IBusinessRule
    {
        private readonly int _quantity;

        public RequestMustHaveValidQuantityRule(int quantity)
        {
            _quantity = quantity;
        }

        public string Message => "Requested blood quantity must be greater than 0.";

        public bool IsBroken() => _quantity <= 0;
    }
}