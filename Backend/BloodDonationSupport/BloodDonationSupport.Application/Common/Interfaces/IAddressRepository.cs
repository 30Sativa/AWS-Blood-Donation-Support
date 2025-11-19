using BloodDonationSupport.Domain.Addresses.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IAddressRepository : IGenericRepository<AddressDomain>
    {
       Task<long> AddAndReturnIdAsync(AddressDomain domain);

    }
}

