using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Posts.Events
{
    public sealed class PostPublishedEvent : IDomainEvent
    {
        public long PostId { get; }
        public string Title { get; }
        public DateTime PublishedAt { get; }
        public DateTime OccurredOn => PublishedAt;

        public PostPublishedEvent(long postId, string title, DateTime publishedAt)
        {
            PostId = postId;
            Title = title;
            PublishedAt = publishedAt;
        }
    }
}
