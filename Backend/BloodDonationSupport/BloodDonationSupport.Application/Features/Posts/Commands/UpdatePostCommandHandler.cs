using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public class UpdatePostCommandHandler : IRequestHandler<UpdatePostCommand, BaseResponse<PostResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostRepository _postRepository;
        private readonly IPostTagRepository _postTagRepository;

        public UpdatePostCommandHandler(IUnitOfWork unitOfWork, IPostRepository postRepository, IPostTagRepository postTagRepository)
        {
            _unitOfWork = unitOfWork;
            _postRepository = postRepository;
            _postTagRepository = postTagRepository;
        }

        public async Task<BaseResponse<PostResponse>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            var post = await _postRepository.GetByIdAsync(request.id);
            if (post == null)
            {
                return BaseResponse<PostResponse>.FailureResponse("Post not found.");
            }

            // update content and excerpt
            post.UpdateContent(dto.Content, dto.Excerpt);

            //xử lí tags
            post.ClearTags();

            if (dto.TagNames == null || !dto.TagNames.Any())
            {
                return BaseResponse<PostResponse>.FailureResponse("TagNames cannot be null or empty.");
            }
            foreach (var tagName in dto.TagNames)
            {
                var normalized = tagName.Trim().ToLower().Replace(" ", "-");
                var existing = await _postTagRepository.FindAsync(t => t.TagSlug == normalized);
                var tag = existing.FirstOrDefault();

                if (tag == null)
                {
                    tag = new Domain.Posts.Entities.PostTag(tagName, normalized);
                    await _postTagRepository.AddAsync(tag);
                }

                post.AddTag(tag);
            }

            if (dto.IsPublished && !post.IsPublished)
            {
                post.Publish();
            }
            _postRepository.Update(post);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = new PostResponse
            {
                Id = post.Id,
                Title = post.Title.Value,
                Slug = post.Slug.Value,
                Excerpt = post.Excerpt,
                IsPublished = post.IsPublished,
                CreatedAt = post.CreatedAt,
                PublishedAt = post.PublishedAt,
                Tags = post.Tags.Select(t => t.TagName).ToList()
            };

            return BaseResponse<PostResponse>.SuccessResponse(response, "Post updated successfully");
        }
    }
}