using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using BloodDonationSupport.Domain.Posts.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record CreateTagCommand(CreateTagRequest Request) : IRequest<BaseResponse<PostTagResponse>>;

    public class CreateTagCommandHandler
        : IRequestHandler<CreateTagCommand, BaseResponse<PostTagResponse>>
    {
        private readonly IPostTagRepository _postTagRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateTagCommandHandler(IPostTagRepository postTagRepository, IUnitOfWork unitOfWork)
        {
            _postTagRepository = postTagRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<PostTagResponse>> Handle(CreateTagCommand request, CancellationToken cancellationToken)
        {
            var name = request.Request.TagName?.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                return BaseResponse<PostTagResponse>.FailureResponse("Tag name is required.");
            }

            var slug = Slugify(name);
            if (await _postTagRepository.ExistsAsync(t => t.TagSlug == slug))
            {
                return BaseResponse<PostTagResponse>.FailureResponse("Tag slug already exists.");
            }

            var tag = new PostTag(name, slug);
            await _postTagRepository.AddAsync(tag);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new PostTagResponse
            {
                Id = tag.Id,
                TagName = tag.TagName,
                TagSlug = tag.TagSlug
            };

            return BaseResponse<PostTagResponse>.SuccessResponse(response, "Tag created successfully.");
        }

        private static string Slugify(string input) =>
            input.Trim().ToLowerInvariant()
                 .Replace(" ", "-");
    }
}

