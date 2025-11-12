using BloodDonationSupport.Domain.Requests.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IRequestRepository : IGenericRepository<RequestDomain>
    {
    }
}
