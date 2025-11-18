using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly AppDbContext _context;

        public AddressRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<long> AddAsync(AddressData address)
        {
            var entity = new Address
            {
                Line1 = address.Line1,
                District = address.District,
                City = address.City,
                Province = address.Province,
                Country = address.Country ?? "Vietnam",
                PostalCode = address.PostalCode,
                NormalizedAddress = address.NormalizedAddress,
                PlaceId = address.PlaceId,
                ConfidenceScore = address.ConfidenceScore,
                Latitude = address.Latitude,
                Longitude = address.Longitude
            };

            await _context.Addresses.AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity.AddressId;
        }

        public async Task<AddressData?> GetByIdAsync(long addressId)
        {
            var entity = await _context.Addresses
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AddressId == addressId);

            if (entity == null)
                return null;

            return new AddressData
            {
                AddressId = entity.AddressId,
                Line1 = entity.Line1,
                District = entity.District,
                City = entity.City,
                Province = entity.Province,
                Country = entity.Country,
                PostalCode = entity.PostalCode,
                NormalizedAddress = entity.NormalizedAddress,
                PlaceId = entity.PlaceId,
                ConfidenceScore = entity.ConfidenceScore,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude
            };
        }

        public async Task<bool> UpdateAsync(long addressId, AddressData address)
        {
            var entity = await _context.Addresses.FindAsync(addressId);
            if (entity == null)
                return false;

            entity.Line1 = address.Line1 ?? entity.Line1;
            entity.District = address.District ?? entity.District;
            entity.City = address.City ?? entity.City;
            entity.Province = address.Province ?? entity.Province;
            entity.Country = address.Country ?? entity.Country;
            entity.PostalCode = address.PostalCode ?? entity.PostalCode;
            entity.NormalizedAddress = address.NormalizedAddress ?? entity.NormalizedAddress;
            entity.PlaceId = address.PlaceId ?? entity.PlaceId;
            entity.ConfidenceScore = address.ConfidenceScore ?? entity.ConfidenceScore;
            entity.Latitude = address.Latitude ?? entity.Latitude;
            entity.Longitude = address.Longitude ?? entity.Longitude;

            _context.Addresses.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(long addressId)
        {
            var entity = await _context.Addresses.FindAsync(addressId);
            if (entity == null)
                return false;

            _context.Addresses.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}

