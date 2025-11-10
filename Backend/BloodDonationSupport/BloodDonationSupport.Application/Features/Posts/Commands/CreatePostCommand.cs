using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Posts.DTOs.Request;
using BloodDonationSupport.Application.Features.Posts.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record CreatePostCommand(CreatePostRequest Request) : IRequest<BaseResponse<PostResponse>>
    {
    }
}
