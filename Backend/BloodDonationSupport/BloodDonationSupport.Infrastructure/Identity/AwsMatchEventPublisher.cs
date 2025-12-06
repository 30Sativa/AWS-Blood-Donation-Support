using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using BloodDonationSupport.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Identity
{
    public class AwsMatchEventPublisher : IMatchEventPublisher
    {
        private readonly IAmazonSimpleNotificationService _sns;
        private readonly string _topicArn;

        public AwsMatchEventPublisher(
            IAmazonSimpleNotificationService sns,
            IConfiguration config)
        {
            _sns = sns;
            _topicArn = config["AWS:SnsMatchTopic"]
                        ?? throw new Exception("Missing AWS:SnsMatchTopic config");
        }

        public async Task PublishAsync(object eventMessage, string eventType)
        {
            var payload = JsonSerializer.Serialize(eventMessage);

            var request = new PublishRequest
            {
                TopicArn = _topicArn,
                Message = payload,
                MessageAttributes = new Dictionary<string, MessageAttributeValue>
                {
                    {
                        "EventType",
                        new MessageAttributeValue
                        {
                            DataType = "String",
                            StringValue = eventType
                        }
                    }
                }
            };

            await _sns.PublishAsync(request);
        }
    }
}
