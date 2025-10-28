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

        public RegisterUserHandler(IUnitOfWork unitOfWork, ICognitoService cognitoService, IUserRepository userRepository)
        {
            _unitOfWork = unitOfWork;
            _cognitoService = cognitoService;
            _userRepository = userRepository;
        }
        public async Task<BaseResponse<UserResponse>> Handle(RegisterUserCommand command, CancellationToken cancellationToken)
        {
            var reg = command.request;

            //check mail exists

           var IsEmailExists = await _userRepository.IsExistEmailAsync(reg.Email);
           if (IsEmailExists)
            {
                return BaseResponse<UserResponse>.FailureResponse("Email already exists.");
            }
           //Gọi dịch vụ Cognito để đăng ký người dùng
           var cognitoUserId = await _cognitoService.RegisterUserAsync(reg.Email, reg.Password, reg.PhoneNumber);
            //tạo domain user
            var emailVo = new Email(reg.Email);
            var user = User.RegisterNewUser(emailVo, cognitoUserId, IsEmailExists , reg.PhoneNumber);
            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

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
