using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class ConfirmResetPasswordValidator : AbstractValidator<ConfirmResetPasswordRequest>
    {
        public ConfirmResetPasswordValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.NewPassword).MinimumLength(8);
            RuleFor(x => x.ConfirmationCode).NotEmpty();
        }
    }
}
