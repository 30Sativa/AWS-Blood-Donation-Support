using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Queries
{
    public record GetAllPostsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<BaseResponse<PaginatedResponse<PostResponse>>>
    {
    }
}
