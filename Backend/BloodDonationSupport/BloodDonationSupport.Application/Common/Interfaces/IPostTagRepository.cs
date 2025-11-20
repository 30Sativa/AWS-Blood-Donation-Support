using BloodDonationSupport.Domain.Posts.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostTagRepository
    {
        Task<IEnumerable<PostTag>> GetAllAsync();

        Task<(IEnumerable<PostTag> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<PostTag?> GetByIdAsync(object id);

        Task<IEnumerable<PostTag>> FindAsync(Expression<Func<PostTag, bool>> predicate);

        Task AddAsync(PostTag entity);

        void Update(PostTag entity);

        void Delete(PostTag entity);

        Task<bool> ExistsAsync(Expression<Func<PostTag, bool>> predicate);

        Task<PostTag?> GetBySlugAsync(string slug);
    }
}