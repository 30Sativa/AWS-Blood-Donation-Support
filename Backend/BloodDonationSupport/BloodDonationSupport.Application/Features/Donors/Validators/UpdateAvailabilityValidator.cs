using BloodDonationSupport.Application.Features.Donors.Commands;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Validators
{
    public class UpdateAvailabilityValidator : AbstractValidator<UpdateAvailabilityCommand>
    {
        public UpdateAvailabilityValidator()
        {
            RuleFor(x => x.DonorId)
                .GreaterThan(0).WithMessage("DonorId is required.");

            RuleFor(x => x.Request.Availabilities)
                .NotEmpty().WithMessage("At least one availability is required.");

            RuleForEach(x => x.Request.Availabilities).ChildRules(av =>
            {
                av.RuleFor(a => a.Weekday)
                  .InclusiveBetween((byte)0, (byte)6)
                  .WithMessage("Weekday must be between 0 and 6.");

                av.RuleFor(a => a.TimeFromMin)
                  .InclusiveBetween((short)0, (short)1440);
                av.RuleFor(a => a.TimeToMin)
                  .InclusiveBetween((short)0, (short)1440)
                  .GreaterThan(a => a.TimeFromMin)
                  .WithMessage("Invalid time range.");
            });
        }
    }
}
