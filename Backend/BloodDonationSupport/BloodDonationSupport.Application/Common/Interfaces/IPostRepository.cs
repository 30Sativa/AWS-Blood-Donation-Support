using BloodDonationSupport.Domain.Posts.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostRepository : IGenericRepository<Post>
    {
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