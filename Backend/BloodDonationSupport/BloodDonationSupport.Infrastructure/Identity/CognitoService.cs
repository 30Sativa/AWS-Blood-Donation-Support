using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Amazon.Runtime;
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

            // REGION
            var region = Amazon.RegionEndpoint.GetBySystemName(options.Region ?? "ap-southeast-2");

            // Lấy credentials từ appsettings (nếu có)
            var accessKey = options?.Credentials?.AccessKey;
            var secretKey = options?.Credentials?.SecretKey;

            // ===========================
            // 🔥 FIX CHÍNH Ở ĐÂY
            // ===========================
            if (!string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey))
            {
                // Dùng credential thủ công
                Console.WriteLine("🔐 Using AWS credentials from appsettings.json");

                var credentials = new BasicAWSCredentials(accessKey, secretKey);
                _client = new AmazonCognitoIdentityProviderClient(credentials, region);
            }
            else
            {
                // Dùng IAM Role (Instance Profile)
                Console.WriteLine("🔐 Using IAM Role credentials (EC2 Instance Profile)");
                _client = new AmazonCognitoIdentityProviderClient(region);
            }

            // Các config khác
            _clientId = options.Cognito.ClientId
                ?? throw new ArgumentNullException(nameof(options.Cognito.ClientId));

            _userPoolId = options.Cognito.UserPoolId
                ?? throw new ArgumentNullException(nameof(options.Cognito.UserPoolId));

            _clientSecret = options.Cognito.ClientSecret?.Trim();
            Console.WriteLine("[Cognito] INIT ------------");
            Console.WriteLine($"Region       = {region.SystemName}");
            Console.WriteLine($"UserPoolId   = {_userPoolId}");
            Console.WriteLine($"ClientId     = {_clientId}");
            Console.WriteLine("[Cognito] INIT END --------");

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

        // ===============================
        // REGISTER
        // ===============================
        public async Task<string> RegisterUserAsync(string email, string password, string? phoneNumber)
        {
            Console.WriteLine($"🔍 Registering user in pool: {_userPoolId} | client: {_clientId}");

            try
            {
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

        // ===============================
        // LOGIN
        // ===============================
        public async Task<AuthTokens?> LoginAsync(string email, string password)
        {
            try
            {
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);

                var authRequest = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
                    {
                        { "USERNAME", email },
                        { "PASSWORD", password },
                        { "SECRET_HASH", secretHash }
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

        // ===============================
        // REFRESH TOKEN
        // ===============================
        public async Task<AuthTokens?> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                var request = new InitiateAuthRequest
                {
                    AuthFlow = AuthFlowType.REFRESH_TOKEN_AUTH,
                    ClientId = _clientId,
                    AuthParameters = new Dictionary<string, string>
                    {
                        { "REFRESH_TOKEN", refreshToken },
                        { "SECRET_HASH", CalculateSecretHash("", _clientId, _clientSecret) }
                    }
                };

                var response = await _client.InitiateAuthAsync(request);

                var result = response.AuthenticationResult;
                if (result == null)
                    return null;

                return new AuthTokens
                {
                    AccessToken = result.AccessToken,
                    IdToken = result.IdToken,
                    RefreshToken = refreshToken,
                    ExpiresIn = result.ExpiresIn ?? 3600
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"❌ Failed to refresh token: {ex.Message}");
            }
        }

        // ===============================
        // FORGOT PASSWORD
        // ===============================
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

        // ===============================
        // CONFIRM FORGOT PASSWORD
        // ===============================
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

        // ===============================
        // CONFIRM EMAIL
        // ===============================
        public async Task<bool> ConfirmEmailAsync(string email, string confirmationCode)
        {
            try
            {
                var secretHash = CalculateSecretHash(email, _clientId, _clientSecret);

                var request = new ConfirmSignUpRequest
                {
                    ClientId = _clientId,
                    Username = email,
                    ConfirmationCode = confirmationCode,
                    SecretHash = secretHash
                };

                await _client.ConfirmSignUpAsync(request);

                Console.WriteLine($"✅ Email confirmed successfully for {email}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ConfirmEmail failed: {ex.Message}");
                return false;
            }
        }

        // ===============================
        // ADMIN UPDATE USER
        // ===============================
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

        // ===============================
        // DELETE USER
        // ===============================
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

        // ===============================
        // SET PASSWORD ADMIN
        // ===============================
        public async Task SetUserPasswordAsync(string cognitoUserId, string newPassword, bool permanent = true)
        {
            try
            {
                var request = new AdminSetUserPasswordRequest
                {
                    UserPoolId = _userPoolId,
                    Username = cognitoUserId,
                    Password = newPassword,
                    Permanent = permanent
                };

                await _client.AdminSetUserPasswordAsync(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"❌ Failed to update password: {ex.Message}");
            }
        }

        public async Task<bool?> ValidationTokenAsync(string accessToken)
        {
            try
            {
                // Dùng lệnh GetUser — Nếu token hết hạn sẽ ném lỗi
                var request = new GetUserRequest
                {
                    AccessToken = accessToken
                };

                var response = await _client.GetUserAsync(request);

                return true; // token hợp lệ
            }
            catch (NotAuthorizedException ex)
            {
                Console.WriteLine($"❌ Token invalid or expired: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Unexpected validation error: {ex.Message}");
                return null;
            }
        }

    }
}
