using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Requests;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public record UpdateUserRolesCommand(long UserId, UpdateUserRolesRequest Request)
        : IRequest<BaseResponse<string>>;

    public class UpdateUserRolesCommandHandler
        : IRequestHandler<UpdateUserRolesCommand, BaseResponse<string>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateUserRolesCommandHandler(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateUserRolesCommand command,
            CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(command.UserId);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse("User not found.");
            }

            var requestedRoles = command.Request.RoleCodes
                .Select(code => code.Trim().ToUpperInvariant())
                .Distinct()
                .ToList();

            if (!requestedRoles.Any())
            {
                return BaseResponse<string>.FailureResponse("At least one valid role is required.");
            }

            var validRoles = await _roleRepository.GetAllAsync();
            var validCodes = validRoles.Select(r => r.Code.ToUpperInvariant()).ToHashSet();
            var invalidRoles = requestedRoles.Where(code => !validCodes.Contains(code)).ToList();

            if (invalidRoles.Any())
            {
                return BaseResponse<string>.FailureResponse($"Invalid role codes: {string.Join(", ", invalidRoles)}.");
            }

            await _userRepository.UpdateUserRolesAsync(command.UserId, requestedRoles);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Roles updated successfully.");
        }
    }
}