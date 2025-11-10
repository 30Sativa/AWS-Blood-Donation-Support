using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Validators
{
    public class CreatePostValidator : AbstractValidator<CreatePostRequest>
    {
        public CreatePostValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required");
            RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug is required");
            RuleFor(x => x.Content).NotEmpty().WithMessage("Content cannot be empty");

            RuleFor(x => x.TagNames)
                .NotNull().WithMessage("TagNames cannot be null")
                .Must(list => list.Any()).WithMessage("At least one tag is required");
        }
    }
}
