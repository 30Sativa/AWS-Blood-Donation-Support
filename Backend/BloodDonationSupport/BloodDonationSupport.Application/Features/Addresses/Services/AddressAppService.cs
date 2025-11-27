using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Addresses.Entities;

namespace BloodDonationSupport.Application.Features.Addresses.Services
{
    public class AddressAppService
    {
        private readonly IAddressRepository _addressRepository;

        public AddressAppService(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        /// Lưu địa chỉ trước và trả về AddressId thật
        public async Task<long> CreateAndGetIdAsync(AddressDomain domain)
        {
            // Repo sẽ SaveChanges ngay và trả về AddressId
            var id = await _addressRepository.AddAndReturnIdAsync(domain);
            return id;
        }
    }
}