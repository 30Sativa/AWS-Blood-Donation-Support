﻿using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using BloodDonationSupport.Infrastructure.Common.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Text;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class CognitoService : ICognitoService
    {
        private readonly IConfiguration _config;
        private readonly AmazonCognitoIdentityProviderClient _client;
        private readonly string _clientId;
        private readonly string _userPoolId;
        private readonly string _clientSecret;


        public CognitoService(IOptions<AwsOptions> awsOptions)
        {
            var options = awsOptions.Value;

            //  Ép chính xác region từ appsettings.json
            var region = Amazon.RegionEndpoint.GetBySystemName(options.Region ?? "ap-southeast-2");

            var accessKey = options.Credentials.AccessKey;
            var secretKey = options.Credentials.SecretKey;

            if (string.IsNullOrWhiteSpace(accessKey) || string.IsNullOrWhiteSpace(secretKey))
                throw new Exception("❌ AWS credentials missing in appsettings.json");

            // Thêm log để chắc chắn SDK đang sử dụng đúng region
            Console.WriteLine($"[DEBUG] Forcing region = {region.SystemName}");
            Console.WriteLine($"[DEBUG] Using AWS credentials: {accessKey[..5]}***");

            // Ép credentials và region vào AmazonCognitoIdentityProviderClient
            var credentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
            _client = new AmazonCognitoIdentityProviderClient(credentials, region);

            // Gán các biến còn lại
            _clientId = options.Cognito.ClientId;
            _userPoolId = options.Cognito.UserPoolId;
            _clientSecret = options.Cognito.ClientSecret?.Trim();
        }



        private static string CalculateSecretHash(string username, string clientId, string clientSecret)
        {
            var message = Encoding.UTF8.GetBytes(username + clientId);
            var key = Encoding.UTF8.GetBytes(clientSecret);

            using var hmac = new System.Security.Cryptography.HMACSHA256(key);
            var hash = hmac.ComputeHash(message);
            return Convert.ToBase64String(hash);
        }


        public async Task<string> RegisterUserAsync(string email, string password, string? phoneNumber)
        {
            Console.WriteLine($"🔍 Registering user in pool: {_userPoolId} | client: {_clientId}");

            try
            {
                // Tính secret hash đúng chuẩn AWS
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);

                var request = new SignUpRequest
                {
                    ClientId = _clientId,
                    SecretHash = secretHash,
                    Username = email,
                    Password = password,
                    UserAttributes = new List<AttributeType>
            {
                new AttributeType { Name = "email", Value = email }
            }
                };

                if (!string.IsNullOrEmpty(phoneNumber))
                {
                    request.UserAttributes.Add(new AttributeType
                    {
                        Name = "phone_number",
                        Value = phoneNumber
                    });
                }

                var response = await _client.SignUpAsync(request);

                await _client.AdminConfirmSignUpAsync(new AdminConfirmSignUpRequest
                {
                    Username = email,
                    UserPoolId = _userPoolId
                });

                return response.UserSub;
            }
            catch (Exception ex)
            {
                throw new Exception($"❌ Cognito register failed: {ex.Message}");
            }
        }



        // LOGIN
        public async Task<AuthTokens?> LoginAsync(string email, string password)
        {
            try
            {
                // ✅ Tính SECRET_HASH giống như lúc register
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);

                var authRequest = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
            {
                { "USERNAME", email },
                { "PASSWORD", password },
                { "SECRET_HASH", secretHash } // ⚡️ thêm dòng này
            }
                };

                var response = await _client.InitiateAuthAsync(authRequest);
                var result = response.AuthenticationResult;

                if (result == null)
                    return null;

                return new AuthTokens
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = result.RefreshToken,
                    ExpiresIn = result.ExpiresIn ?? 3600
                };
            }
            catch (NotAuthorizedException)
            {
                throw new Exception("Invalid email or password.");
            }
            catch (UserNotConfirmedException)
            {
                throw new Exception("User is not confirmed. Please verify your email first.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Cognito login failed: {ex.Message}");
            }
        }



        public Task<AuthTokens?> RefreshTokenAsync(string refreshToken) =>
            throw new NotImplementedException();

        public Task<bool?> ValidationTokenAsync(string accessToken) =>
            throw new NotImplementedException();
    }
}
