using Amazon.CognitoIdentityProvider;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class CognitoService : ICognitoService
    {
        private readonly IConfiguration _config;
        private readonly AmazonCognitoIdentityProviderClient _provideClient;
        private readonly string _clientid;
        private readonly string _userPoorId;


        public CognitoService(IConfiguration config, AmazonCognitoIdentityProviderClient provideClient, string clientid, string userPoorId)
        {
            _config = config;
            _provideClient = new AmazonCognitoIdentityProviderClient();
            _clientid = _config["AWS:Cognito:ClientId"]!;
            _userPoorId = _config["AWS:Cognito:UserPoolId"]!;
        }

        public Task<AuthTokens?> LoginAsync(string email, string password)
        {
            throw new NotImplementedException();
        }

        public Task<AuthTokens?> RefreshTokenAsync(string refreshToken)
        {
            throw new NotImplementedException();
        }

        public async Task<string> RegisterUserAsync(string email, string password, string? phonenumber)
        {
            var signUpRequest = new Amazon.CognitoIdentityProvider.Model.SignUpRequest
            {
                ClientId = _clientid,
                Username = _userPoorId,
                Password = password,
            };
            signUpRequest.UserAttributes.Add(new Amazon.CognitoIdentityProvider.Model.AttributeType
            {
                Name = "email",
                Value = email
            });
            if (!string.IsNullOrEmpty(phonenumber))
            {
                signUpRequest.UserAttributes.Add(new Amazon.CognitoIdentityProvider.Model.AttributeType
                {
                    Name = "phone_number",
                    Value = phonenumber
                });
            }
            var result = await _provideClient.SignUpAsync(signUpRequest);
            return result.UserSub;
        }

        public Task<bool?> ValidationTokenAsync(string accessToken)
        {
            throw new NotImplementedException();
        }
    }
}
