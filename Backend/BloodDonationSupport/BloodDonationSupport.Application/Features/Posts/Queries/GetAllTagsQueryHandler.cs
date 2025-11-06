using BloodDonationSupport.Application.Common.Interfaces;
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
    public class GetAllTagsQueryHandler : IRequestHandler<GetAllTagsQuery, BaseResponse<IEnumerable<PostTag>>>
    {

        private readonly IPostTagRepository _postTagRepository; 

        public GetAllTagsQueryHandler(IPostTagRepository postTagRepository)
        {
            _postTagRepository = postTagRepository;
        }
        public async Task<BaseResponse<IEnumerable<PostTag>>> Handle(GetAllTagsQuery request, CancellationToken cancellationToken)
        {
            var tags =  await _postTagRepository.GetAllAsync();

            return BaseResponse<IEnumerable<PostTag>>.SuccessResponse(
                tags,
                "Fetched successfully"
            );
        }
    }
}
