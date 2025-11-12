using BloodDonationSupport.Application.Features.Requests.DTOs.Request;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.RequesterUserId).GreaterThan(0);
            RuleFor(x => x.BloodTypeId).GreaterThan(0);
            RuleFor(x => x.ComponentId).GreaterThan(0);
            RuleFor(x => x.QuantityUnits).GreaterThan(0);
            RuleFor(x => x.Urgency)
                .Must(v => new[] { "LOW", "NORMAL", "HIGH" }.Contains(v.ToUpper()))
                .WithMessage("Urgency must be LOW, NORMAL, or HIGH");
        }
    }
}
