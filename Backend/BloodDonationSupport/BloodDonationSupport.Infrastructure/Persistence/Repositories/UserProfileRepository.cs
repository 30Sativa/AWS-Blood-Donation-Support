using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Users.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class UserProfileRepository : GenericRepository<UserProfileDomain>, IUserProfileRepository
    {
        private readonly AppDbContext _context;
        public UserProfileRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }


    }
}
