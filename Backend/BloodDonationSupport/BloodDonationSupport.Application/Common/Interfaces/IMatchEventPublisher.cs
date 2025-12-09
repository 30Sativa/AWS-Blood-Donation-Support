using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IMatchEventPublisher
    {
        Task PublishAsync(object eventMessage, string eventType);
    }
}
