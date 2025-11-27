using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class UpdateReadyStatusValidator : AbstractValidator<UpdateReadyStatusRequest>
    {
        public UpdateReadyStatusValidator()
        {
            RuleFor(x => x.IsReady)
                .NotNull()
                .WithMessage("IsReady must be provided.");
        }
    }
}