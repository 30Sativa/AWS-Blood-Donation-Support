using BloodDonationSupport.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Domain.Shared.ValueObjects
{
    public class GeoLocation : ValueObject
    {
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }

        private GeoLocation() { }

        private GeoLocation(double latitude, double longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }

        public static GeoLocation Create(double latitude, double longitude)
        {
            if (latitude < -90 || latitude > 90)
                throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90.");
            if (longitude < -180 || longitude > 180)
                throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180.");

            return new GeoLocation(latitude, longitude);
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Latitude;
            yield return Longitude;
        }

        public override string ToString() => $"{Latitude},{Longitude}";
    }
}
