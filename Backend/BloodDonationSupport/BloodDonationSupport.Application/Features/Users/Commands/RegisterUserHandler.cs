using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using BloodDonationSupport.Domain.Common;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Domain.Users.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, BaseResponse<UserResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICognitoService _cognitoService;
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;

        public RegisterUserHandler(IUnitOfWork unitOfWork, ICognitoService cognitoService, IUserRepository userRepository, IUserProfileRepository userProfileRepository)
        {
            _unitOfWork = unitOfWork;
            _cognitoService = cognitoService;
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }
        public async Task<BaseResponse<UserResponse>> Handle(RegisterUserCommand command, CancellationToken cancellationToken)
        {
            var reg = command.request;


            // 🔍 Check email exists in DB
            var isEmailExists = await _userRepository.IsExistEmailAsync(reg.Email);


            if (isEmailExists)
            {
                return BaseResponse<UserResponse>.FailureResponse("Email already exists.");
            }

            // ✅ Call Cognito register

            var cognitoUserId = await _cognitoService.RegisterUserAsync(reg.Email, reg.Password, reg.PhoneNumber);


            // 🧩 Create domain user
            var emailVo = new Email(reg.Email);
            var user = UserDomain.RegisterNewUser(emailVo, cognitoUserId, isEmailExists, reg.PhoneNumber);
            await _userRepository.AddAsync(user);
            
            // Save to get the generated UserId
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            // Get the generated UserId from database
            var userId = await _userRepository.GetUserIdByEmailAsync(user.Email.Value);
            
            if (userId > 0)
            {
                // Assign default role
                await _userRepository.AssignDefaultRoleAsync(userId);
                
                // Create user profile (required theo schema)
                var userProfile = UserProfileDomain.Create(
                    userId: userId,
                    fullName: reg.FullName,
                    birthYear: null, // Optional - có thể thêm sau
                    gender: null, // Optional - có thể thêm sau
                    privacyPhoneVisibleToStaffOnly: true // Default theo schema
                );
                await _userProfileRepository.AddAsync(userProfile);
                
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                // Update domain entity with the generated UserId
                user.GetType().GetProperty("Id")?.SetValue(user, userId);
            }

            return BaseResponse<UserResponse>.SuccessResponse(
                new UserResponse
                {
                    Id = user.Id,
                    Email = user.Email.ToString(),
                    CognitoUserId = user.CognitoUserId
                },
                "Register successfully"
            );
        }

    }
}
