using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Users.Validators
{
    public class UpdateUserRolesRequestValidator : AbstractValidator<UpdateUserRolesRequest>
    {
        public UpdateUserRolesRequestValidator()
        {
            RuleFor(x => x.RoleCodes)
                .NotNull().WithMessage("Role codes are required.")
                .Must(list => list.Any()).WithMessage("At least one role code must be provided.")
                .Must(list => list.All(code => !string.IsNullOrWhiteSpace(code)))
                .WithMessage("Role codes cannot be empty.");
        }
    }
}

