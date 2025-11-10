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

            RuleFor(x => x.RoleCode)
                .Must(role => AllowedRoles.Contains(role.ToUpper()))
                .WithMessage("Role must be one of: ADMIN, STAFF, MEMBER.");

            RuleFor(x => x.Gender)
                .Must(g => string.IsNullOrWhiteSpace(g) || AllowedGenders.Contains(g))
                .WithMessage("Gender must be one of: Male, Female, Other.");

            RuleFor(x => x.BirthYear)
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .When(x => x.BirthYear.HasValue)
                .WithMessage("Birth year must be between 1900 and current year.");
        }
    }
}