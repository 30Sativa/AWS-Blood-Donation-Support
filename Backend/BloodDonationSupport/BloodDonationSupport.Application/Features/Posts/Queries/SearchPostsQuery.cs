using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record SearchPostsQuery(
        string? Keyword,
        string? TagSlug,
        bool? IsPublished,
        int PageNumber,
        int PageSize) : IRequest<BaseResponse<PaginatedResponse<PostResponse>>>;

    public class SearchPostsQueryHandler
        : IRequestHandler<SearchPostsQuery, BaseResponse<PaginatedResponse<PostResponse>>>
    {
        private readonly IPostRepository _postRepository;

        public SearchPostsQueryHandler(IPostRepository postRepository)
        {
            _postRepository = postRepository;
        }

        public async Task<BaseResponse<PaginatedResponse<PostResponse>>> Handle(
            SearchPostsQuery request,
            CancellationToken cancellationToken)
        {
            var (posts, totalCount) = await _postRepository.SearchAsync(
                request.Keyword,
                request.TagSlug,
                request.IsPublished,
                request.PageNumber,
                request.PageSize);

            var responses = posts.Select(p => new PostResponse
            {
                Id = p.Id,
                Title = p.Title.Value,
                Slug = p.Slug.Value,
                Excerpt = p.Excerpt,
                IsPublished = p.IsPublished,
                CreatedAt = p.CreatedAt,
                PublishedAt = p.PublishedAt,
                Tags = p.Tags.Select(t => t.TagName).ToList()
            }).ToList();

            var paged = new PaginatedResponse<PostResponse>
            {
                Items = responses,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };

            return BaseResponse<PaginatedResponse<PostResponse>>.SuccessResponse(paged, "Posts filtered successfully.");
        }
    }
}