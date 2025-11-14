using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Posts.Validators
{
    public class UpdateTagRequestValidator : AbstractValidator<UpdateTagRequest>
    {
        public UpdateTagRequestValidator()
        {
            RuleFor(x => x.TagName)
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}

