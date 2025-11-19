using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class UpdateHealthConditionsValidator : AbstractValidator<UpdateHealthConditionsRequest>
    {
        public UpdateHealthConditionsValidator()
        {
            RuleFor(x => x.DonorId)
                .GreaterThan(0);

            RuleForEach(x => x.HealthConditionIds)
                .GreaterThan(0);
        }
    }
}
