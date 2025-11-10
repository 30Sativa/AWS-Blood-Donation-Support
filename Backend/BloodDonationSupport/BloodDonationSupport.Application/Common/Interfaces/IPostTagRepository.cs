using BloodDonationSupport.Domain.Posts.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IPostTagRepository : IGenericRepository<PostTag>
    {
        Task<PostTag?> GetBySlugAsync(string slug);
    }
}
