using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using BloodDonationSupport.Domain.Addresses.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly AppDbContext _context;

        public AddressRepository(AppDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // CREATE (UnitOfWork handles SaveChanges)
        // =========================================================
        public async Task AddAsync(AddressDomain domain)
        {
            var entity = new Address
            {
                Line1 = domain.Line1,
                District = domain.District,
                City = domain.City,
                Province = domain.Province,
                Country = domain.Country,
                PostalCode = domain.PostalCode,
                NormalizedAddress = domain.NormalizedAddress,
                PlaceId = domain.PlaceId,
                ConfidenceScore = domain.ConfidenceScore,
                Latitude = domain.Latitude,
                Longitude = domain.Longitude
            };

            await _context.Addresses.AddAsync(entity);

            // Không SaveChanges ở đây (UnitOfWork sẽ xử lý)
            domain.SetId(entity.AddressId);
        }

        // =========================================================
        // CREATE + RETURN ID (Dùng cho UpdateDonorLocation)
        // =========================================================
        public async Task<long> AddAndReturnIdAsync(AddressDomain domain)
        {
            var entity = new Address
            {
                Line1 = domain.Line1,
                District = domain.District,
                City = domain.City,
                Province = domain.Province,
                Country = domain.Country,
                PostalCode = domain.PostalCode,
                NormalizedAddress = domain.NormalizedAddress,
                PlaceId = domain.PlaceId,
                ConfidenceScore = domain.ConfidenceScore,
                Latitude = domain.Latitude,
                Longitude = domain.Longitude
            };

            _context.Addresses.Add(entity);
            await _context.SaveChangesAsync(); // cần ID ngay lập tức

            domain.SetId(entity.AddressId);
            return entity.AddressId;
        }

        // =========================================================
        // GET BY ID
        // =========================================================
        public async Task<AddressDomain?> GetByIdAsync(object id)
        {
            if (id is not long addressId)
                return null;

            var entity = await _context.Addresses
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AddressId == addressId);

            if (entity == null)
                return null;

            return AddressDomain.Rehydrate(
                id: entity.AddressId,
                line1: entity.Line1,
                district: entity.District,
                city: entity.City,
                province: entity.Province,
                country: entity.Country,
                postalCode: entity.PostalCode,
                normalizedAddress: entity.NormalizedAddress,
                placeId: entity.PlaceId,
                confidenceScore: entity.ConfidenceScore,
                latitude: entity.Latitude ?? 0,
                longitude: entity.Longitude ?? 0
            );
        }

        // =========================================================
        // GET ALL
        // =========================================================
        public async Task<IEnumerable<AddressDomain>> GetAllAsync()
        {
            var entities = await _context.Addresses.AsNoTracking().ToListAsync();

            return entities.Select(e =>
                AddressDomain.Rehydrate(
                    e.AddressId,
                    e.Line1,
                    e.District,
                    e.City,
                    e.Province,
                    e.Country,
                    e.PostalCode,
                    e.NormalizedAddress,
                    e.PlaceId,
                    e.ConfidenceScore,
                    e.Latitude ?? 0,
                    e.Longitude ?? 0
                )
            );
        }

        // =========================================================
        // FIND
        // =========================================================
        public async Task<IEnumerable<AddressDomain>> FindAsync(Expression<Func<AddressDomain, bool>> predicate)
        {
            var all = await GetAllAsync();
            return all.AsQueryable().Where(predicate);
        }

        // =========================================================
        // EXISTS
        // =========================================================
        public async Task<bool> ExistsAsync(Expression<Func<AddressDomain, bool>> predicate)
        {
            var all = await GetAllAsync();
            return all.AsQueryable().Any(predicate);
        }

        // =========================================================
        // UPDATE
        // =========================================================
        public void Update(AddressDomain domain)
        {
            var entity = _context.Addresses.FirstOrDefault(a => a.AddressId == domain.Id);
            if (entity == null) return;

            entity.Line1 = domain.Line1;
            entity.District = domain.District;
            entity.City = domain.City;
            entity.Province = domain.Province;
            entity.Country = domain.Country;
            entity.PostalCode = domain.PostalCode;
            entity.NormalizedAddress = domain.NormalizedAddress;
            entity.PlaceId = domain.PlaceId;
            entity.ConfidenceScore = domain.ConfidenceScore;
            entity.Latitude = domain.Latitude;
            entity.Longitude = domain.Longitude;

            _context.Addresses.Update(entity);
        }

        // =========================================================
        // DELETE
        // =========================================================
        public void Delete(AddressDomain domain)
        {
            var entity = _context.Addresses.FirstOrDefault(a => a.AddressId == domain.Id);
            if (entity != null)
                _context.Addresses.Remove(entity);
        }

        // =========================================================
        // PAGED
        // =========================================================
        public async Task<(IEnumerable<AddressDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Addresses.AsNoTracking();
            var total = await query.CountAsync();

            var entities = await query
                .OrderByDescending(a => a.AddressId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var domains = entities.Select(e =>
                AddressDomain.Rehydrate(
                    e.AddressId,
                    e.Line1,
                    e.District,
                    e.City,
                    e.Province,
                    e.Country,
                    e.PostalCode,
                    e.NormalizedAddress,
                    e.PlaceId,
                    e.ConfidenceScore,
                    e.Latitude ?? 0,
                    e.Longitude ?? 0
                )
            );

            return (domains, total);
        }

        
    }
}
