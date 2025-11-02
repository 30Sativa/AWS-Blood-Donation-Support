using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Users.Rules
{
    public class UniqueEmailRule
    {
        public static void Check(bool emailExists)
        {
            if (emailExists)
            {
                throw new DomainException("Email already exists.");
            }
        }
    }
}
