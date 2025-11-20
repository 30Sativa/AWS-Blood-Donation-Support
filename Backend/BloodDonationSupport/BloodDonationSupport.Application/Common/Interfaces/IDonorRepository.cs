using BloodDonationSupport.Domain.Donors.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IDonorRepository
    {
        Task<IEnumerable<DonorDomain>> GetAllAsync();

        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<DonorDomain?> GetByIdAsync(object id);

        Task<IEnumerable<DonorDomain>> FindAsync(Expression<Func<DonorDomain, bool>> predicate);

        Task AddAsync(DonorDomain entity);

        void Update(DonorDomain entity);

        void Delete(DonorDomain entity);

        Task<bool> ExistsAsync(Expression<Func<DonorDomain, bool>> predicate);

        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedWithRelationsAsync(int pageNumber, int pageSize);
        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> SearchAsync(
            string? keyword,
            int? bloodTypeId,
            bool? isReady,
            int pageNumber,
            int pageSize);
        Task<DonorDomain?> GetByIdWithRelationsAsync(long donorId);
        Task<DonorDomain?> GetByIdWithAvailabilitiesAsync(long donorId);
        Task<DonorDomain?> GetByUserIdAsync(long userId);
        Task<DonorDomain?> GetByUserIdWithRelationsAsync(long userId);
        Task<long> GetDonorIdByUserIdAsync(long userId);
        Task<List<DonorDomain>> GetDonorsByBloodTypesAsync(IEnumerable<int> bloodTypeIds);
    }
}
