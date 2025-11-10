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
    public class ConfirmResetPasswordCommandHandler : IRequestHandler<ConfirmResetPasswordCommand, BaseResponse<string>>
    {
        private readonly ICognitoService _cognitoService;

        public ConfirmResetPasswordCommandHandler(ICognitoService cognitoService)
        {
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<string>> Handle(ConfirmResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var success = await _cognitoService.ConfirmForgotPasswordAsync(
                request.Request.Email,
                request.Request.ConfirmationCode,
                request.Request.NewPassword
            );

            if (!success)
                return BaseResponse<string>.FailureResponse("Failed to reset password.");

            return BaseResponse<string>.SuccessResponse("Password reset successfully.", "✅ Password updated.");
        }
    }
}
