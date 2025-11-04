using BloodDonationSupport.Domain.Users.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserProfileRepository : IGenericRepository<UserProfileDomain>
    {
        Task<IEnumerable<UserProfileDomain>> GetAllActiveProfilesAsync();
    }
}
