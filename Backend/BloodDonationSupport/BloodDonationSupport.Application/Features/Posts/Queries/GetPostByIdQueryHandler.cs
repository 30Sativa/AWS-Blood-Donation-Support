using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, BaseResponse<PostResponse>>
    {
        private readonly IPostRepository _postRepository;

        public GetPostByIdQueryHandler(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }

        public async Task<BaseResponse<PostResponse>> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
        {
            var post = await _postRepository.GetByIdAsync(request.id);
            if (post == null)
            {
                return BaseResponse<PostResponse>.FailureResponse("Post not found.");
            }
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

            return BaseResponse<PostResponse>.SuccessResponse(response, "Fetched post successfully");
        }
    }
}