using BloodDonationSupport.Application.Features.Users.Commands;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserValidator()
        {
            RuleFor(x => x.request)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("Request cannot be null.")
                .SetValidator(new RegisterUserRequestValidator())
                .When(x => x.request is not null);
        }
    }
}