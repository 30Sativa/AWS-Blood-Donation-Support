using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        private static readonly string[] AllowedRoles = new[] { "ADMIN", "STAFF", "MEMBER" };
        private static readonly string[] AllowedGenders = new[] { "Nam", "Nữ", "Khác" };

        public CreateUserRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.FullName)
                .NotEmpty().MaximumLength(200);

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^[0-9]{10,11}$").WithMessage("Phone number must be 10-11 digits.");

            RuleFor(x => x.RoleCode)
                .Must(role => AllowedRoles.Contains(role.ToUpper()))
                .WithMessage("Role must be one of: ADMIN, STAFF, MEMBER.");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.")
                .Must(g => AllowedGenders.Contains(g))
                .WithMessage("Gender must be one of: Nam, Nữ, Khác.");

            RuleFor(x => x.BirthYear)
                .NotNull().WithMessage("Birth year is required.")
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .WithMessage("Birth year must be between 1900 and current year.");
        }
    }
}