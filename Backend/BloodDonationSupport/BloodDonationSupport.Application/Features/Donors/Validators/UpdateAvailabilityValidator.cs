using BloodDonationSupport.Application.Features.Donors.Commands;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class UpdateAvailabilityValidator : AbstractValidator<UpdateAvailabilityRequest>
    {
        public UpdateAvailabilityValidator()
        {
            RuleFor(x => x.DonorId).GreaterThan(0);

            RuleFor(x => x.Availabilities)
                .NotEmpty()
                .WithMessage("Availability list cannot be empty.");

            RuleForEach(x => x.Availabilities)
                .SetValidator(new DonorAvailabilityDtoValidator());
        }
    }
}