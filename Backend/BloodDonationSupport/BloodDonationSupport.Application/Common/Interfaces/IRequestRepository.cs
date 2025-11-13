using BloodDonationSupport.Domain.Requests.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IRequestRepository : IGenericRepository<RequestDomain>
    {
        Task<long?> GetLatestRequestIdByRequesterIdAsync(long requesterUserId);
    }
}