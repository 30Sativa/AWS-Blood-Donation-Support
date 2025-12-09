using BloodDonationSupport.Domain.Posts.Entities;
using System.Linq.Expressions;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostRepository
    {
        Task<IEnumerable<Post>> GetAllAsync();

        Task<(IEnumerable<Post> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);

        Task<Post?> GetByIdAsync(object id);

        Task<IEnumerable<Post>> FindAsync(Expression<Func<Post, bool>> predicate);

        Task AddAsync(Post entity);

        void Update(Post entity);

        void Delete(Post entity);

        Task<bool> ExistsAsync(Expression<Func<Post, bool>> predicate);

        Task<(IEnumerable<Post> Items, int TotalCount)> GetPagedWithTagsAsync(int pageNumber, int pageSize);

        Task<Post?> GetBySlugAsync(string slug);

        Task<IEnumerable<Post>> GetAllWithTagsAsync();

        Task<(IEnumerable<Post> Items, int TotalCount)> SearchAsync(
            string? keyword,
            string? tagSlug,
            bool? isPublished,
            int pageNumber,
            int pageSize);

        Task<(IEnumerable<Post> Items, int TotalCount)> GetPublishedPagedAsync(int pageNumber, int pageSize, string? tagSlug);

        Task<Post?> GetPublishedBySlugAsync(string slug);

        Task<bool> IsTagUsedAsync(int tagId);
    }
}