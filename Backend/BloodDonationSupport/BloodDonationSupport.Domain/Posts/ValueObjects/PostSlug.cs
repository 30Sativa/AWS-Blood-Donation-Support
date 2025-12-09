using BloodDonationSupport.Domain.Common;
using System.Text.RegularExpressions;

namespace BloodDonationSupport.Domain.Posts.ValueObjects
{
    public class PostSlug : ValueObject
    {
        public string Value { get; private set; } = string.Empty;

        public PostSlug(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Slug cannot be empty.");

            if (!Regex.IsMatch(value, "^[a-z0-9-]+$"))
                throw new ArgumentException("Slug must contain only lowercase letters, numbers and hyphens.");

            Value = value.Trim().ToLowerInvariant();
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString() => Value;
    }
}