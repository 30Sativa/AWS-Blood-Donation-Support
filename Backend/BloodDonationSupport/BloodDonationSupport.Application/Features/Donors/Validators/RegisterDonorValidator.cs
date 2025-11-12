using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class RegisterDonorValidator : AbstractValidator<RegisterDonorRequest>
    {
        public RegisterDonorValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("UserId is required");

            RuleFor(x => x.TravelRadiusKm)
                .InclusiveBetween(1, 100)
                .WithMessage("Travel radius must be between 1 and 100 km");

            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90)
                .When(x => x.Latitude.HasValue)
                .WithMessage("Invalid latitude value");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180)
                .When(x => x.Longitude.HasValue)
                .WithMessage("Invalid longitude value");
        }
    }
}