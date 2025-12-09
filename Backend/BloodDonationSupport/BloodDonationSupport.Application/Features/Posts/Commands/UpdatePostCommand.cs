using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record UpdatePostCommand(long id, CreatePostRequest Request) : IRequest<BaseResponse<PostResponse>>
    {
    }
}