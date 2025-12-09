using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record GetPostByIdQuery(long id) : IRequest<BaseResponse<PostResponse>>
    {
    }
}