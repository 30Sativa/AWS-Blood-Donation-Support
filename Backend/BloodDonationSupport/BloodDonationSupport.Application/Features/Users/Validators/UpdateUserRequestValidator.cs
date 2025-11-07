using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
    {
        public UpdateUserRequestValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("User ID is required.");

            RuleFor(x => x.Email)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
                .WithMessage("Invalid email format.");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\+?[1-9]\d{1,15}$")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
                .WithMessage("Invalid phone number format.");

            RuleFor(x => x.FullName)
                .MaximumLength(200)
                .When(x => !string.IsNullOrEmpty(x.FullName))
                .WithMessage("Full name must not exceed 200 characters.");
        }
    }
}