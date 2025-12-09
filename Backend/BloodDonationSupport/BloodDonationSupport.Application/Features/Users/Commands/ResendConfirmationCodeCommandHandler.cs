using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class ResendConfirmationCodeCommandHandler : IRequestHandler<ResendConfirmationCodeCommand, BaseResponse<string>>
    {
        private readonly ICognitoService _cognitoService;

        public ResendConfirmationCodeCommandHandler(ICognitoService cognitoService)
        {
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<string>> Handle(ResendConfirmationCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _cognitoService.ResendConfirmationCodeAsync(request.Request.Email);

                return success
                    ? BaseResponse<string>.SuccessResponse("Verification code resent successfully", "📩 New verification code sent to your email.")
                    : BaseResponse<string>.FailureResponse("Failed to resend verification code.");
            }
            catch (Exception ex)
            {
                // Return the specific error message from CognitoService
                return BaseResponse<string>.FailureResponse(ex.Message);
            }
        }
    }
}

