using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, BaseResponse<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _profileRepository;
        private readonly ICognitoService _cognitoService;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteUserCommandHandler(
            IUserRepository userRepository,
            IUserProfileRepository profileRepository,
            ICognitoService cognitoService,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _profileRepository = profileRepository;
            _cognitoService = cognitoService;
            _unitOfWork = unitOfWork;
        }
        public async Task<BaseResponse<string>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.userId);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse($"User with ID {request.userId} does not exist.");
            }
            try
            {
                //xóa trên cognito trước
                if (string.IsNullOrWhiteSpace(user.CognitoUserId))
                {
                    await _cognitoService.DeleteUserAsync(user.CognitoUserId);
                }

                //xóa profile nếu có
                var profile = await _profileRepository.GetByIdAsync(request.userId);
                if (profile != null)
                {
                    _profileRepository.Delete(profile);
                }

                //xóa user chính
                _userRepository.Delete(user);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return BaseResponse<string>.SuccessResponse(
                    null,
                    "User deleted successfully.");
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse($"Error deleting user: {ex.Message}");
            }
        }
    }
}
