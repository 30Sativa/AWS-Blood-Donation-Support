using Amazon.Runtime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Common.Options
{
    public class AwsOptions
    {
        public string Region { get; set; } = default!;
        public CognitoOptions Cognito { get; set; } = default!;
        public AwsCredentials Credentials { get; set; } = new();
    }

    public class CognitoOptions
    {
        public string UserPoolId { get; set; } = default!;
        public string ClientId { get; set; } = default!;
        public string ClientSecret { get; set; } = default!;
    }

    public class AwsCredentials
    {
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
    }
}
