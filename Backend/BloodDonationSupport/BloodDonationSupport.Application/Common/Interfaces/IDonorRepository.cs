using BloodDonationSupport.Domain.Donors.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IDonorRepository : IGenericRepository<DonorDomain>
    {
        Task<(IEnumerable<DonorDomain> Items, int TotalCount)> GetPagedWithRelationsAsync(int pageNumber, int pageSize);

        Task<DonorDomain?> GetByIdWithRelationsAsync(long donorId);

        Task<DonorDomain?> GetByIdWithAvailabilitiesAsync(long donorId);
    }
}