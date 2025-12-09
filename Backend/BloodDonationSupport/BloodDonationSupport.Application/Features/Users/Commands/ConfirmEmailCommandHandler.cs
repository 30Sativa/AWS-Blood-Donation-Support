using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, BaseResponse<string>>
    {
        private readonly ICognitoService _cognitoService;

        public ConfirmEmailCommandHandler(ICognitoService cognitoService)
        {
            _cognitoService = cognitoService;
        }

        public async Task<BaseResponse<string>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _cognitoService.ConfirmEmailAsync(
                    request.Request.Email,
                    request.Request.ConfirmationCode
                );

                return success
                    ? BaseResponse<string>.SuccessResponse("Email confirmed successfully", "✅ Account activated.")
                    : BaseResponse<string>.FailureResponse("Invalid or expired verification code.");
            }
            catch (Exception ex)
            {
                // Return the specific error message from CognitoService
                return BaseResponse<string>.FailureResponse(ex.Message);
            }
        }
    }
}