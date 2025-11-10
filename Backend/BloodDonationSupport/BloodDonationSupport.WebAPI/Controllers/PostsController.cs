using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.Commands;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using BloodDonationSupport.Application.Features.Posts.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    }
}
