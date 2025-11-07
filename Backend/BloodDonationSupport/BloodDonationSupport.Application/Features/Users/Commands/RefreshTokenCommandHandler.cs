using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Commands
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, BaseResponse<AuthTokens>>
    {
        private readonly ICognitoService _cognitoService;
        public RefreshTokenCommandHandler(ICognitoService cognitoService)
        {
            _cognitoService = cognitoService;
        }
        public async Task<BaseResponse<AuthTokens>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.RefreshToken)) 
            {
                return BaseResponse<AuthTokens>.FailureResponse("Refresh token is required.");
            }
            var tokens = await _cognitoService.RefreshTokenAsync(request.RefreshToken);
            if (tokens == null)
                return BaseResponse<AuthTokens>.FailureResponse("Failed to refresh token.");

            return BaseResponse<AuthTokens>.SuccessResponse(tokens, "Token refreshed successfully.");

        }
    }
}
