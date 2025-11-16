using BloodDonationSupport.Domain.Donors.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IDonorRepository : IGenericRepository<DonorDomain>
    {
        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedWithRelationsAsync(int pageNumber, int pageSize);

        Task<DonorDomain?> GetByIdWithRelationsAsync(long donorId);

        Task<DonorDomain?> GetByIdWithAvailabilitiesAsync(long donorId);

        Task<DonorDomain?> GetByUserIdAsync(long userId);

        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> SearchAsync(
            string? keyword,
            int? bloodTypeId,
            bool? isReady,
            int pageNumber,
            int pageSize);

        Task<List<DonorDomain>> GetDonorsByBloodTypesAsync(IEnumerable<int> bloodTypeIds);
    }
}