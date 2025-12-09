using BloodDonationSupport.Application.Features.Matches.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Matches.Validators
{
    public class AcceptMatchValidator : AbstractValidator<AcceptMatchCommand>
    {
        public AcceptMatchValidator()
        {
            RuleFor(x => x.MatchId).GreaterThan(0);
        }
    }
}
