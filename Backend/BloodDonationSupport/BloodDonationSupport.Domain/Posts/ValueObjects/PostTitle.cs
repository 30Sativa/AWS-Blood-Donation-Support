using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Posts.ValueObjects
{
    public class PostTitle : ValueObject
    {
        public string Value { get; private set; }

        private PostTitle()
        { }

        public PostTitle(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Title cannot be empty.");

            Value = value.Trim();
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString() => Value;
    }
}