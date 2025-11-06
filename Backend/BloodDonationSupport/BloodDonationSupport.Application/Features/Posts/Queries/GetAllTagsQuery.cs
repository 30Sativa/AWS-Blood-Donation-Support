using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Posts.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record GetAllTagsQuery() : IRequest<BaseResponse<IEnumerable<PostTag>>>
    {
    }
}
