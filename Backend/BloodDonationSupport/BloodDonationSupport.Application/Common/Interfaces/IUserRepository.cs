using BloodDonationSupport.Domain.Users.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<bool> IsExistEmailAsync(string email);
        Task<User?> GetByEmailAsync(string email);
    }
}
