using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Users.DTOs.Shared;
using BloodDonationSupport.Infrastructure.Common.Options;
using Microsoft.Extensions.Options;
using System.Text;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class CognitoService : ICognitoService
    {
        private readonly AmazonCognitoIdentityProviderClient _client;
        private readonly string _clientId;
        private readonly string _userPoolId;
        private readonly string? _clientSecret;

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
            _clientId = options.Cognito.ClientId ?? throw new ArgumentNullException(nameof(options.Cognito.ClientId));
            _userPoolId = options.Cognito.UserPoolId ?? throw new ArgumentNullException(nameof(options.Cognito.UserPoolId));
            _clientSecret = options.Cognito.ClientSecret?.Trim();
        }

        private static string CalculateSecretHash(string username, string clientId, string? clientSecret)
        {
            if (string.IsNullOrEmpty(clientSecret))
                throw new ArgumentException("Client secret is required", nameof(clientSecret));

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
                // ✅ Tính secret hash đúng chuẩn AWS
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

                // ✅ Gọi Cognito đăng ký
                var response = await _client.SignUpAsync(request);

                // ❌ KHÔNG GỌI AdminConfirmSignUp nữa
                // Cognito sẽ tự gửi email verify đến người dùng
                Console.WriteLine($"📧 Verification email sent to {email}");

                return response.UserSub;
            }
            catch (UsernameExistsException)
            {
                throw new Exception("⚠️ Email is already registered.");
            }
            catch (InvalidPasswordException)
            {
                throw new Exception("⚠️ Password does not meet Cognito policy requirements.");
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

        public async Task<AuthTokens?> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                //  Dùng flow REFRESH_TOKEN_AUTH của AWS
                var request = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.REFRESH_TOKEN_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
            {
                { "REFRESH_TOKEN", refreshToken },
                { "SECRET_HASH", CalculateSecretHash("", _clientId, _clientSecret) } // secret bắt buộc nếu có
            }
                };

                var response = await _client.InitiateAuthAsync(request);
                var result = response.AuthenticationResult;

                if (result == null)
                    return null;

                // ✅ Trả về token mới
                return new AuthTokens
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = refreshToken, // vẫn giữ refresh token cũ
                    ExpiresIn = result.ExpiresIn ?? 3600
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Refresh token failed: {ex.Message}");
                throw new Exception($"Failed to refresh token: {ex.Message}");
            }
        }
           

        public Task<bool?> ValidationTokenAsync(string accessToken) =>
            throw new NotImplementedException();
        // UPDATE USER
        public async Task UpdateUserAsync(string cognitoUserId, string? newEmail, string? newPhoneNumber)
        {
            var request = new AdminUpdateUserAttributesRequest
            {
                UserPoolId = _userPoolId,
                Username = cognitoUserId,
                UserAttributes = new List<AttributeType>()
            };

            if (!string.IsNullOrEmpty(newEmail))
                request.UserAttributes.Add(new AttributeType { Name = "email", Value = newEmail });

            if (!string.IsNullOrEmpty(newPhoneNumber))
                request.UserAttributes.Add(new AttributeType { Name = "phone_number", Value = newPhoneNumber });

            await _client.AdminUpdateUserAttributesAsync(request);
        }

        public async Task DeleteUserAsync(string cognitoUserId)
        {
            try
            {
                var request = new AdminDeleteUserRequest
                {
                    UserPoolId = _userPoolId,
                    Username = cognitoUserId
                };
                await _client.AdminDeleteUserAsync(request);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Failed to delete user from Cognito: {ex.Message}");
            }
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            try
            {
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);
                var request = new ForgotPasswordRequest
                {
                    ClientId = _clientId,
                    Username = email,
                    SecretHash = secretHash
                };

                var response = await _client.ForgotPasswordAsync(request);
                Console.WriteLine($"📩 Verification code sent to {response.CodeDeliveryDetails.Destination}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ForgotPassword failed: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ConfirmForgotPasswordAsync(string email, string confirmationCode, string newPassword)
        {
            try
            {
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);
                var request = new ConfirmForgotPasswordRequest
                {
                    ClientId = _clientId,
                    Username = email,
                    Password = newPassword,
                    ConfirmationCode = confirmationCode,
                    SecretHash = secretHash
                };

                await _client.ConfirmForgotPasswordAsync(request);
                Console.WriteLine($"✅ Password reset successful for {email}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ConfirmForgotPassword failed: {ex.Message}");
                return false;
            }
        }
    }
}