using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class RegisterDonorValidator : AbstractValidator<RegisterDonorRequest>
    {
        public RegisterDonorValidator()
        {
            RuleFor(x => x.UserId)
           .GreaterThan(0);

            RuleFor(x => x.BloodTypeId)
                .GreaterThan(0);

            RuleFor(x => x.FullAddress)
                .NotEmpty()
                .MinimumLength(5);

            RuleFor(x => x.TravelRadiusKm)
                .InclusiveBetween(1, 100);

            RuleForEach(x => x.Availabilities).SetValidator(new DonorAvailabilityDtoValidator());
        }
    }
}