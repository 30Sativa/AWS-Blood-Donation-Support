using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, BaseResponse<UserResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _profileRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ICognitoService _cognitoService;
        private readonly IUnitOfWork _unitOfWork;
        public UpdateUserCommandHandler(
            IUserRepository userRepository,
            IUserProfileRepository profileRepository,
            IRoleRepository roleRepository,
            ICognitoService cognitoService,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _profileRepository = profileRepository;
            _roleRepository = roleRepository;
            _cognitoService = cognitoService;
            _unitOfWork = unitOfWork;
        }
        public async Task<BaseResponse<UserResponse>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;
            var user = await _userRepository.GetByIdAsync(dto.Id);
            if (user == null)
            {
                return BaseResponse<UserResponse>.FailureResponse($"User with Id {dto.Id} does not exist.");
            }
            // Đồng bộ với cognito nếu có thay đổi số điện thoại/email
            if (!string.IsNullOrEmpty(dto.PhoneNumber) && dto.PhoneNumber != user.PhoneNumber)
            {
                await _cognitoService.UpdateUserAsync(user.CognitoUserId, user.CognitoUserId, dto.PhoneNumber);
            }
            // Cập nhật domain entity
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.UpdatePhone(dto.PhoneNumber);
            if (dto.IsActive.HasValue && dto.IsActive == false)
                user.Deactivate();
            // Cập nhật nếu role thay đổi
            if (!string.IsNullOrWhiteSpace(dto.RoleCode))
            {
                var roleExists = await _roleRepository.IsExistRoleCodeAsync(dto.RoleCode);
                if (!roleExists)
                    throw new ArgumentException($"Role '{dto.RoleCode}' does not exist.");
                await _userRepository.AssignRoleAsync(user.Id, dto.RoleCode);
            }
            // Cập nhật profile
            var profile = await _profileRepository.GetByIdAsync(user.Id);
            if (profile != null)
            {
                profile.UpdateProfile(dto.FullName ?? profile.FullName, dto.BirthYear, dto.Gender);
                _profileRepository.Update(profile);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<UserResponse>.SuccessResponse(
    new UserResponse
    {
        Id = user.Id,
        Email = dto.Email ?? user.Email.Value,
        PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber,
        FullName = dto.FullName ?? profile?.FullName ?? string.Empty,
        BirthYear = dto.BirthYear ?? profile?.BirthYear,
        Gender = dto.Gender ?? profile?.Gender,
        Role = dto.RoleCode ?? string.Join(", ", await _userRepository.GetRolesByUserIdAsync(user.Id)),
        CognitoUserId = user.CognitoUserId,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    },
    "User updated successfully."
);

        }
    }
}