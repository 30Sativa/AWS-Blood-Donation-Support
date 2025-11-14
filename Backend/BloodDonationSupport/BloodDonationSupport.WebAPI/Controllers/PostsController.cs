using BloodDonationSupport.Application.Features.Posts.Commands;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PostsController> _logger;

        public PostsController(IMediator mediator, ILogger<PostsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        // [POST] api/posts
        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
        {
            var result = await _mediator.Send(new CreatePostCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/posts/{id}
        [HttpPut("{id:long}")]
        public async Task<IActionResult> UpdatePost(long id, [FromBody] CreatePostRequest request)
        {
            var result = await _mediator.Send(new UpdatePostCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [GET] api/posts
        [HttpGet]
        public async Task<IActionResult> GetAllPosts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllPostsQuery(pageNumber, pageSize));
            return Ok(result);
        }

        // [GET] api/posts/search
        [HttpGet("search")]
        public async Task<IActionResult> SearchPosts([FromQuery] SearchPostsRequest request)
        {
            var query = new SearchPostsQuery(
                request.Keyword,
                request.TagSlug,
                request.IsPublished,
                request.PageNumber,
                request.PageSize);

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // [GET] api/posts/published
        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedPosts([FromQuery] GetPublishedPostsRequest request)
        {
            var result = await _mediator.Send(new GetPublishedPostsQuery(
                request.TagSlug,
                request.PageNumber,
                request.PageSize));
            return Ok(result);
        }

        // [GET] api/posts/slug/{slug}
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug, [FromQuery] bool publishedOnly = true)
        {
            var result = await _mediator.Send(new GetPostBySlugQuery(slug, publishedOnly));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [GET] api/posts/{id}
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetPostById(long id)
        {
            var result = await _mediator.Send(new GetPostByIdQuery(id));
            return result.Success ? Ok(result) : NotFound(result);
        }

        // [DELETE] api/posts/{id}
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeletePost(long id)
        {
            var result = await _mediator.Send(new DeletePostCommand(id));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [GET] api/posts/tags
        [HttpGet("tags")]
        public async Task<IActionResult> GetAllTags()
        {
            var result = await _mediator.Send(new GetAllTagsQuery());
            return Ok(result);
        }

        // [POST] api/posts/tags
        [HttpPost("tags")]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagRequest request)
        {
            var result = await _mediator.Send(new CreateTagCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [PUT] api/posts/tags/{id}
        [HttpPut("tags/{id:int}")]
        public async Task<IActionResult> UpdateTag(int id, [FromBody] UpdateTagRequest request)
        {
            var result = await _mediator.Send(new UpdateTagCommand(id, request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // [DELETE] api/posts/tags/{id}
        [HttpDelete("tags/{id:int}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var result = await _mediator.Send(new DeleteTagCommand(id));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}