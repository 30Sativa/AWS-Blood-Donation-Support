using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Posts.Rules
{
    public class UniqueSlugRule : IBusinessRule
    {
        private readonly Func<string, bool> _slugExists;
        private readonly string _slug;

        public UniqueSlugRule(string slug, Func<string, bool> slugExists)
        {
            _slugExists = slugExists;
            _slug = slug;
        }

        public string Message => $"Slug '{_slug}' already exists.";

        public bool IsBroken() => _slugExists(_slug);
    }
}