using BloodDonationSupport.Domain.Common;
using System.Text.RegularExpressions;

namespace BloodDonationSupport.Domain.Users.ValueObjects
{
    public class Email
    {
        public string Value { get; }

        private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        public Email(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || !EmailRegex.IsMatch(value))
            {
                throw new DomainException("Invalid email format.");
            }
            Value = value;
        }

        public override string ToString() => Value;
    }
}