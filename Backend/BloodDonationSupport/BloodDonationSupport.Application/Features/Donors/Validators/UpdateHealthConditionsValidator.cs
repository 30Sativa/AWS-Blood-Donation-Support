using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;

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