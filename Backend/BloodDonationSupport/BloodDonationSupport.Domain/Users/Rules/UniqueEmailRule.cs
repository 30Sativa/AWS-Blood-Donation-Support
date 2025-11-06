using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.Rules
{
    public class UniqueEmailRule : IBusinessRule
    {
        private readonly bool _emailExists;

        public UniqueEmailRule(bool emailExists)
        {
            _emailExists = emailExists;
        }

        public string Message => "Email already exists.";

        public bool IsBroken() => _emailExists;
    }
}