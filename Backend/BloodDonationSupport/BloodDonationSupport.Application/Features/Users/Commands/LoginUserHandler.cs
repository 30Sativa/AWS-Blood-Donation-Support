using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using BloodDonationSupport.Domain.Users.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, BaseResponse<LoginResponse>>
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly ICognitoService _cognitoService;
        private readonly IUserRepository _userRepository;

        public LoginUserHandler(IUnitOfWork unitOfWork, ICognitoService cognitoService, IUserRepository userRepository)
        {
            _unitOfWork = unitOfWork;
            _cognitoService = cognitoService;
            _userRepository = userRepository;
        }



        public async Task<BaseResponse<LoginResponse>> Handle(LoginUserCommand command, CancellationToken cancellationToken)
        {
            var req = command.request;
            // check user exists
            var user = await _userRepository.GetByEmailWithRolesAsync(req.Email);
            if(user == null)
            {
                return BaseResponse<LoginResponse>.FailureResponse("Invalid email or password.");
            }
            var token = await _cognitoService.LoginAsync(req.Email, req.Password);
            if(token == null)
            {
                return BaseResponse<LoginResponse>.FailureResponse("Invalid email or password.");
            }
            else
            {
                return BaseResponse<LoginResponse>.SuccessResponse(
                    new LoginResponse
                    {
                        AccessToken = token.AccessToken,
                        RefreshToken = token.RefreshToken,
                        ExpiresIn = token.ExpiresIn,
                        User = new AuthResponse
                        {
                            Id = user.Id,
                            Email = user.Email.ToString(),
                            CognitoUserId = user.CognitoUserId
                        },
                        Roles = user.Roles.ToList()
                    },
                    "Login successfully"
                );
            }
        }
    }
}
