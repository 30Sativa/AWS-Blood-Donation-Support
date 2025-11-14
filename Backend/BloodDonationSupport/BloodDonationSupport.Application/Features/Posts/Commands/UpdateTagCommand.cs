using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record UpdateTagCommand(int TagId, UpdateTagRequest Request)
        : IRequest<BaseResponse<PostTagResponse>>;

    public class UpdateTagCommandHandler
        : IRequestHandler<UpdateTagCommand, BaseResponse<PostTagResponse>>
    {
        private readonly IPostTagRepository _postTagRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateTagCommandHandler(IPostTagRepository postTagRepository, IUnitOfWork unitOfWork)
        {
            _postTagRepository = postTagRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<PostTagResponse>> Handle(UpdateTagCommand request, CancellationToken cancellationToken)
        {
            var tag = await _postTagRepository.GetByIdAsync(request.TagId);
            if (tag == null)
            {
                return BaseResponse<PostTagResponse>.FailureResponse("Tag not found.");
            }

            var name = request.Request.TagName?.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                return BaseResponse<PostTagResponse>.FailureResponse("Tag name is required.");
            }

            var slug = Slugify(name);
            if (await _postTagRepository.ExistsAsync(t => t.TagSlug == slug && t.Id != tag.Id))
            {
                return BaseResponse<PostTagResponse>.FailureResponse("Tag slug already exists.");
            }

            tag.Update(name, slug);
            _postTagRepository.Update(tag);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new PostTagResponse
            {
                Id = tag.Id,
                TagName = tag.TagName,
                TagSlug = tag.TagSlug
            };

            return BaseResponse<PostTagResponse>.SuccessResponse(response, "Tag updated successfully.");
        }

        private static string Slugify(string input) =>
            input.Trim().ToLowerInvariant()
                 .Replace(" ", "-");
    }
}

