using BloodDonationSupport.Domain.Requests.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IRequestRepository
    {
        Task<IEnumerable<RequestDomain>> GetAllAsync();

        Task<(IEnumerable<RequestDomain> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<RequestDomain?> GetByIdAsync(object id);

        Task<IEnumerable<RequestDomain>> FindAsync(Expression<Func<RequestDomain, bool>> predicate);

        Task AddAsync(RequestDomain entity);

        void Update(RequestDomain entity);

        void Delete(RequestDomain entity);

        Task<bool> ExistsAsync(Expression<Func<RequestDomain, bool>> predicate);

        Task<long?> GetLatestRequestIdByRequesterIdAsync(long requesterUserId);

        Task<List<RequestDomain>> GetByRequesterIdAsync(long requesterUserId);
        Task<List<RequestDomain>> FindByUserIdAsync(long userId);

    }
}