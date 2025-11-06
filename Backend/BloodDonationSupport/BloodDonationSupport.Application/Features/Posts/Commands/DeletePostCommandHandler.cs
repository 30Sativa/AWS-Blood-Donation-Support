using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, BaseResponse<bool>>
    {

        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeletePostCommandHandler(IPostRepository postRepository, IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<BaseResponse<bool>> Handle(DeletePostCommand request, CancellationToken cancellationToken)
        {
            var post  = await _postRepository.GetByIdAsync(request.id);
            if(post == null)
            {
                return BaseResponse<bool>.FailureResponse("Post not found.");
            }
            _postRepository.Delete(post);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return BaseResponse<bool>.SuccessResponse(true, "Post deleted successfully.");
        }
    }
}
