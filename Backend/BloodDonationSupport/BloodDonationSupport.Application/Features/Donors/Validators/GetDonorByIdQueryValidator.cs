using BloodDonationSupport.Application.Features.Donors.Queries;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class GetDonorByIdQueryValidator : AbstractValidator<GetDonorByIdQuery>
    {
        public GetDonorByIdQueryValidator()
        {
            RuleFor(x => x.DonorId)
                .GreaterThan(0)
                .WithMessage("Donor ID must be greater than 0.");
        }
    }
}