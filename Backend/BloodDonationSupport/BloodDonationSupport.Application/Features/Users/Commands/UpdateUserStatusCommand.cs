using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record UpdateUserStatusCommand(long UserId, UpdateUserStatusRequest Request)
        : IRequest<BaseResponse<string>>;

    public class UpdateUserStatusCommandHandler
        : IRequestHandler<UpdateUserStatusCommand, BaseResponse<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUserStatusCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateUserStatusCommand command,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(command.UserId);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse("User not found.");
            }

            if (command.Request.IsActive)
                user.Activate();
            else
                user.Deactivate();

            _userRepository.Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var msg = command.Request.IsActive ? "User activated successfully." : "User deactivated successfully.";
            return BaseResponse<string>.SuccessResponse(msg);
        }
    }
}

