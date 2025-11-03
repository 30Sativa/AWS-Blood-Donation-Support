using BloodDonationSupport.Application.Features.Users.Commands;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class RegisterUserRequestValidator : AbstractValidator<RegisterUserRequest>
    {
        public RegisterUserRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
                .WithMessage("Password must have at least 8 characters, including upper/lowercase, number and special symbol.");


            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\+?[1-9]\d{1,15}$")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
                .WithMessage("Invalid phone number format.");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(200).WithMessage("Full name must not exceed 200 characters.");

            RuleFor(x => x.BirthYear)
                .InclusiveBetween(1900, DateTime.UtcNow.Year)
                .When(x => x.BirthYear.HasValue)
                .WithMessage("Birth year must be between 1900 and current year.");

            RuleFor(x => x.Gender)
                .Must(g => string.IsNullOrWhiteSpace(g) || new[] { "Male", "Female", "Other" }.Contains(g))
                .WithMessage("Gender must be one of: Male, Female, Other.");
        }
    }
}
