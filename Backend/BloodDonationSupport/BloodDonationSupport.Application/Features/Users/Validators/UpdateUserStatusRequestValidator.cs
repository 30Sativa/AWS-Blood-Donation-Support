using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class UpdateUserStatusRequestValidator : AbstractValidator<UpdateUserStatusRequest>
    {
        public UpdateUserStatusRequestValidator()
        {
            RuleFor(x => x)
                .NotNull();
        }
    }
}