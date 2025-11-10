using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Common
{
    public interface IBusinessRule
    {
        string Message { get; }
        bool IsBroken();
    }
}
