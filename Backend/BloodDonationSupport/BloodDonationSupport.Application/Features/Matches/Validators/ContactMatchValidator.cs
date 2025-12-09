using BloodDonationSupport.Application.Features.Matches.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Validators
{
    public class ContactMatchValidator : AbstractValidator<ContactMatchCommand>
    {
        public ContactMatchValidator()
        {
            RuleFor(x => x.MatchId)
                .GreaterThan(0).WithMessage("MatchId must be greater than zero.");
        }
    }
}
