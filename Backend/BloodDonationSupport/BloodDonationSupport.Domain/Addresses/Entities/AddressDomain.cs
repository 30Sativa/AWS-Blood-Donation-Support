using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Addresses.Entities
{
    public class AddressDomain : BaseEntity<long>
    {
        // ─────────────── BASIC FIELDS ───────────────
        public string Line1 { get; private set; } = null!;

        public string District { get; private set; } = null!;
        public string City { get; private set; } = null!;
        public string Province { get; private set; } = null!;
        public string? Country { get; private set; }
        public string? PostalCode { get; private set; }

        // ─────────────── NORMALIZED FIELDS (from AWS Location) ───────────────
        public string? NormalizedAddress { get; private set; }

        public string? PlaceId { get; private set; }
        public decimal? ConfidenceScore { get; private set; }

        // ─────────────── GEOPOSITION ───────────────
        public double Latitude { get; private set; }

        public double Longitude { get; private set; }

        private AddressDomain()
        { }  // Required for EF Core

        private AddressDomain(
            string line1,
            string district,
            string city,
            string province,
            string? country,
            string? postalCode,
            string? normalizedAddress,
            string? placeId,
            decimal? confidenceScore,
            double latitude,
            double longitude)
        {
            Line1 = line1;
            District = district;
            City = city;
            Province = province;
            Country = country;
            PostalCode = postalCode;
            NormalizedAddress = normalizedAddress;
            PlaceId = placeId;
            ConfidenceScore = confidenceScore;
            Latitude = latitude;
            Longitude = longitude;
        }

        // ───────────────────────── Factory create method ─────────────────────────
        public static AddressDomain Create(
            string line1,
            string district,
            string city,
            string province,
            string? country,
            string? postalCode,
            string? normalizedAddress,
            string? placeId,
            decimal? confidenceScore,
            double latitude,
            double longitude)
        {
            return new AddressDomain(
                line1,
                district,
                city,
                province,
                country,
                postalCode,
                normalizedAddress,
                placeId,
                confidenceScore,
                latitude,
                longitude
            );
        }

        // ───────────────────────── Rehydrate (load from DB) ─────────────────────────
        public static AddressDomain Rehydrate(
            long id,
            string line1,
            string district,
            string city,
            string province,
            string? country,
            string? postalCode,
            string? normalizedAddress,
            string? placeId,
            decimal? confidenceScore,
            double latitude,
            double longitude)
        {
            return new AddressDomain
            {
                Id = id,
                Line1 = line1,
                District = district,
                City = city,
                Province = province,
                Country = country,
                PostalCode = postalCode,
                NormalizedAddress = normalizedAddress,
                PlaceId = placeId,
                ConfidenceScore = confidenceScore,
                Latitude = latitude,
                Longitude = longitude
            };
        }
    }
}