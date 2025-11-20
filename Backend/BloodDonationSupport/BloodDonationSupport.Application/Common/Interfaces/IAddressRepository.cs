using BloodDonationSupport.Domain.Addresses.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAddressRepository
    {
        Task<IEnumerable<AddressDomain>> GetAllAsync();

        Task<(IEnumerable<AddressDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<AddressDomain?> GetByIdAsync(object id);

        Task<IEnumerable<AddressDomain>> FindAsync(Expression<Func<AddressDomain, bool>> predicate);

        Task AddAsync(AddressDomain domain);

        Task<long> AddAndReturnIdAsync(AddressDomain domain);

        void Update(AddressDomain domain);

        void Delete(AddressDomain domain);

        Task<bool> ExistsAsync(Expression<Func<AddressDomain, bool>> predicate);
    }
}

