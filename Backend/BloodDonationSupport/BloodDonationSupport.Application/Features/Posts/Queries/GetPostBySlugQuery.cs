using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record GetPostBySlugQuery(string Slug, bool PublishedOnly)
        : IRequest<BaseResponse<PostResponse>>;

    public class GetPostBySlugQueryHandler
        : IRequestHandler<GetPostBySlugQuery, BaseResponse<PostResponse>>
    {
        private readonly IPostRepository _postRepository;

        public GetPostBySlugQueryHandler(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }

        public async Task<BaseResponse<PostResponse>> Handle(
            GetPostBySlugQuery request,
            CancellationToken cancellationToken)
        {
            var post = request.PublishedOnly
                ? await _postRepository.GetPublishedBySlugAsync(request.Slug)
                : await _postRepository.GetBySlugAsync(request.Slug);

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

            return BaseResponse<PostResponse>.SuccessResponse(response);
        }
    }
}

