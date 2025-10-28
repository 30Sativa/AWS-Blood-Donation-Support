using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.ValueObjects
{
    public class Email
    {
        public string Value { get; }


        private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        public Email(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new DomainException("Invalid email format.");
            }
            Value = value;
        }

        public override string ToString() => Value;
    }
}