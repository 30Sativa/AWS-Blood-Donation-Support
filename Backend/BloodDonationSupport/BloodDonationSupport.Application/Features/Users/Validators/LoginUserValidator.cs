using BloodDonationSupport.Application.Features.Users.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
