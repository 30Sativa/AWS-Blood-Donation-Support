using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class UpdateMyProfileRequestValidator : AbstractValidator<UpdateMyProfileRequest>
    {
        public UpdateMyProfileRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(30)
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));

            RuleFor(x => x.BirthYear)
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .When(x => x.BirthYear.HasValue);

            RuleFor(x => x.Gender)
                .MaximumLength(20)
                .When(x => !string.IsNullOrWhiteSpace(x.Gender));
        }
    }
}