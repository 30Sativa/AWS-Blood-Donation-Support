using BloodDonationSupport.Domain.Posts.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostRepository : IGenericRepository<Post>
    {
        Task<(IEnumerable<Post> Items, int TotalCount)> GetPagedWithTagsAsync(int pageNumber, int pageSize);

        Task<Post?> GetBySlugAsync(string slug);

        Task<IEnumerable<Post>> GetAllWithTagsAsync();
    }
}