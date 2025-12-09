using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Posts.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record GetAllTagsQuery() : IRequest<BaseResponse<IEnumerable<PostTag>>>
    {
    }
}