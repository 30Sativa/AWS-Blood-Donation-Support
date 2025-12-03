using BloodDonationSupport.Application.Features.Matches.Commands;
using BloodDonationSupport.Application.Features.Matches.Commands.CreateMatch;
using BloodDonationSupport.Application.Features.Matches.DTOs.Request;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace BloodDonationSupport.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatchesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<MatchesController> _logger;

        public MatchesController(IMediator mediator, ILogger<MatchesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateMatch([FromBody] CreateMatchRequest request)
        {
            if (request == null)
            {
                return BadRequest("Request body cannot be null.");
            }

            var result = await _mediator.Send(new CreateMatchCommand(request));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ============================
        // [PUT] /api/matches/{id}/contact
        // Staff đánh dấu đã liên hệ
        // ============================
        [HttpPut("{id}/contact")]
        public async Task<IActionResult> ContactMatch(long id)
        {
            var result = await _mediator.Send(new ContactMatchCommand(id));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ============================
        // [PUT] /api/matches/{id}/accept
        // Donor đồng ý
        // ============================
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptMatch(long id)
        {
            var result = await _mediator.Send(new AcceptMatchCommand (id));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ============================
        // [PUT] /api/matches/{id}/decline
        // Donor từ chối
        // ============================
        [HttpPut("{id}/decline")]
        public async Task<IActionResult> DeclineMatch(long id)
        {
            var result = await _mediator.Send(new DeclineMatchCommand (id));
            return result.Success ? Ok(result) : BadRequest(result);
        }

        // ============================
        // [PUT] /api/matches/{id}/no-answer
        // Donor không phản hồi
        // ============================
        [HttpPut("{id}/no-answer")]
        public async Task<IActionResult> MarkNoAnswer(long id)
        {
            var result = await _mediator.Send(new MarkNoAnswerCommand (id));
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
