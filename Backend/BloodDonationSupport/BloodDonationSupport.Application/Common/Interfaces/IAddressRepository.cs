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

    public class AddressData
    {
        public long? AddressId { get; set; }
        public string? Line1 { get; set; }
        public string? District { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string? NormalizedAddress { get; set; }
        public string? PlaceId { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}

