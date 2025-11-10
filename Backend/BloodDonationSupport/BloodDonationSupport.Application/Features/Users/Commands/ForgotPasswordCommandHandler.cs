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
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, BaseResponse<string>>
    {
        private readonly ICognitoService _cognitoService;

        public ForgotPasswordCommandHandler(ICognitoService cognitoService)
        {
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var success = await _cognitoService.ForgotPasswordAsync(request.Email);

            if (!success)
                return BaseResponse<string>.FailureResponse("Failed to send reset code.");

            return BaseResponse<string>.SuccessResponse("Code sent successfully", "Verification code sent to your email/phone");
        }
    }
}
