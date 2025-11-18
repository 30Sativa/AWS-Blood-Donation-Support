using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAddressRepository
    {
        Task<long> AddAsync(AddressData address);
        Task<AddressData?> GetByIdAsync(long addressId);
        Task<bool> UpdateAsync(long addressId, AddressData address);
        Task<bool> DeleteAsync(long addressId);
        Task<(IEnumerable<AddressData> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
    }
}

