using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
    {
        public UpdateUserRequestValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Email)
                .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.BirthYear)
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .When(x => x.BirthYear.HasValue);
        }
    }
}