using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
