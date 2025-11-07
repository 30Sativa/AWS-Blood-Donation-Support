using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using BloodDonationSupport.Domain.Users.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, BaseResponse<UserResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRoleRepository _roleRepository;
        private readonly ICognitoService _cognitoService;

        public CreateUserCommandHandler(
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository,
            IUnitOfWork unitOfWork,
            IRoleRepository roleRepository,
            ICognitoService cognitoService)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
            _unitOfWork = unitOfWork;
            _roleRepository = roleRepository;
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<UserResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var dto = request.request;
            //check role is exist
            var IsRoleExist = await _roleRepository.IsExistRoleCodeAsync(dto.RoleCode);
            if (!IsRoleExist)
            {
                return BaseResponse<UserResponse>.FailureResponse($"Role {dto.RoleCode}  does not exist.");
            }
            var IsEmailExists = await _userRepository.IsExistEmailAsync(dto.Email);
            if (IsEmailExists)
            {
                return BaseResponse<UserResponse>.FailureResponse($"Email {dto.Email} already exists.");
            }
            var tempPassword = "Thanhdeptrai@2004";//có thể tạo 1 password random sau này
            var cognitoUserId = await _cognitoService.RegisterUserAsync(dto.Email, tempPassword, dto.PhoneNumber);

            //create domain for user
            var emailVo = new Domain.Users.ValueObjects.Email(dto.Email);
            var user = Domain.Users.Entities.UserDomain.RegisterNewUser(emailVo, cognitoUserId, IsEmailExists, dto.PhoneNumber);
            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            //find userid
            var userId = await _userRepository.GetUserIdByEmailAsync(dto.Email);
            //assign role to user
            // Gán role cho user
            await _userRepository.AssignRoleAsync(userId, dto.RoleCode);

            // Tạo user profile
            var profile = UserProfileDomain.Create(
                userId,
                dto.FullName,
                dto.BirthYear,
                dto.Gender,
                true
            );
            await _userProfileRepository.AddAsync(profile);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            //Trả về response
            return BaseResponse<UserResponse>.SuccessResponse(
                new UserResponse
                {
                    Id = userId,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                    FullName = dto.FullName,
                    BirthYear = dto.BirthYear,
                    Gender = dto.Gender,
                    Role = dto.RoleCode,
                    CognitoUserId = cognitoUserId,
                    CreatedAt = DateTime.UtcNow
                },
                "User created successfully.");
        }
    }
}