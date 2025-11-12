using BloodDonationSupport.Domain.Posts.Entities;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostTagRepository : IGenericRepository<PostTag>
    {
        Task<PostTag?> GetBySlugAsync(string slug);
    }
}