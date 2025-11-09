using BloodDonationSupport.Application.Features.Donors.Queries;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
