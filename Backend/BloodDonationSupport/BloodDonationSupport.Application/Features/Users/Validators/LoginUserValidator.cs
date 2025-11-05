using BloodDonationSupport.Application.Features.Users.Commands;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class LoginUserValidator : AbstractValidator<LoginUserCommand>
    {
        public LoginUserValidator()
        {
            RuleFor(x => x.request.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.request.Password)
                .NotEmpty().WithMessage("Password is required.");
        }
    }
}