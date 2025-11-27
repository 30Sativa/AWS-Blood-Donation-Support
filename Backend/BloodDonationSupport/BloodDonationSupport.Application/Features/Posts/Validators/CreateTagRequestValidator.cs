using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using FluentValidation;

namespace BloodDonationSupport.Application.Features.Posts.Validators
{
    public class CreateTagRequestValidator : AbstractValidator<CreateTagRequest>
    {
        public CreateTagRequestValidator()
        {
            RuleFor(x => x.TagName)
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}