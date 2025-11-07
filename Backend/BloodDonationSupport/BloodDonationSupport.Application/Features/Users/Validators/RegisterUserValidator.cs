using BloodDonationSupport.Application.Features.Users.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserValidator()
        {
            RuleFor(x => x.request)
                .NotNull().WithMessage("Request cannot be null.")
                .SetValidator(new RegisterUserRequestValidator());
        }
    }
}
