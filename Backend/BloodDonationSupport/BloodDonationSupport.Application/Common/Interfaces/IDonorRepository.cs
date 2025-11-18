using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Domain.Donors.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IDonorRepository : IGenericRepository<DonorDomain>
    {
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
