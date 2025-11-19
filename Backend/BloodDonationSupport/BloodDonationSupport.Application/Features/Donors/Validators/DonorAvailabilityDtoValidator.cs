using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class DonorAvailabilityDtoValidator : AbstractValidator<DonorAvailabilityDto>
    {
        public DonorAvailabilityDtoValidator()
        {
            RuleFor(x => x.Weekday)
                .InclusiveBetween((byte)0, (byte)6);

            RuleFor(x => x.TimeFromMin)
                .InclusiveBetween((short)0, (short)1440);

            RuleFor(x => x.TimeToMin)
                .InclusiveBetween((short)1, (short)1440);

            RuleFor(x => x.TimeToMin)
                .GreaterThan(x => x.TimeFromMin)
                .WithMessage("TimeToMin must be greater than TimeFromMin.");
        }
    }
}
