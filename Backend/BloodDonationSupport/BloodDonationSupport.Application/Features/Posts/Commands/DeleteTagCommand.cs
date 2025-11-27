using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Posts.Commands
{
    public record DeleteTagCommand(int TagId) : IRequest<BaseResponse<string>>;

    public class DeleteTagCommandHandler
        : IRequestHandler<DeleteTagCommand, BaseResponse<string>>
    {
        private readonly IPostTagRepository _postTagRepository;
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteTagCommandHandler(
            IPostTagRepository postTagRepository,
            IPostRepository postRepository,
            IUnitOfWork unitOfWork)
        {
            _postTagRepository = postTagRepository;
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(DeleteTagCommand request, CancellationToken cancellationToken)
        {
            var tag = await _postTagRepository.GetByIdAsync(request.TagId);
            if (tag == null)
            {
                return BaseResponse<string>.FailureResponse("Tag not found.");
            }

            if (await _postRepository.IsTagUsedAsync(tag.Id))
            {
                return BaseResponse<string>.FailureResponse("Tag is currently used by posts.");
            }

            _postTagRepository.Delete(tag);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Tag deleted successfully.");
        }
    }
}