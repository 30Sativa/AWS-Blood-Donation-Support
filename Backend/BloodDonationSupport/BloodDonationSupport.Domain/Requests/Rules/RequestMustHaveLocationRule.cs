using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Requests.Rules
{
    public class RequestMustHaveLocationRule : IBusinessRule
    {
        private readonly double _lat;
        private readonly double _lng;

        public RequestMustHaveLocationRule(double lat, double lng)
        {
            _lat = lat;
            _lng = lng;
        }

        public string Message => "Request must have a valid latitude and longitude.";

        public bool IsBroken()
        {
            return _lat is < -90 or > 90 || _lng is < -180 or > 180;
        }
    }
}
