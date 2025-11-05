using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.Rules
{
    public class UniqueEmailRule
    {
        public static void Check(bool emailExists)
        {
            if (emailExists)
            {
                throw new DomainException("Email already exists.");
            }
        }
    }
}