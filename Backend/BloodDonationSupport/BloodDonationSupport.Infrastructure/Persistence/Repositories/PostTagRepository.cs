using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Posts.Entities;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class PostTagRepository : IPostTagRepository
    {
        private readonly AppDbContext _context;

        public PostTagRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(PostTag domainEntity)
        {
            var entity = new Models.PostTag
            {
                TagName = domainEntity.TagName,
                TagSlug = domainEntity.TagSlug
            };
            await _context.PostTags.AddAsync(entity);
        }

        public void Delete(PostTag domainEntity)
        {
            var entity = _context.PostTags.FirstOrDefault(t => t.TagId == domainEntity.Id);
            if (entity != null)
            {
                _context.PostTags.Remove(entity);
            }
        }

        public async Task<IEnumerable<PostTag>> GetAllAsync()
        {
            var tags = await _context.PostTags.AsNoTracking().ToListAsync();
            return tags.Select(t => PostTag.Rehydrate(t.TagId, t.TagName, t.TagSlug));
        }

        public async Task<PostTag?> GetByIdAsync(object id)
        {
            if (id is not int tagId) return null;

            var entity = await _context.PostTags.AsNoTracking().FirstOrDefaultAsync(t => t.TagId == tagId);
            return entity == null ? null : PostTag.Rehydrate(entity.TagId, entity.TagName, entity.TagSlug);
        }

        public async Task<IEnumerable<PostTag>> FindAsync(Expression<Func<PostTag, bool>> predicate)
        {
            // Map EF entities to domain then evaluate predicate
            var tags = await _context.PostTags.AsNoTracking().ToListAsync();
            var compiled = predicate.Compile();
            return tags.Select(t => PostTag.Rehydrate(t.TagId, t.TagName, t.TagSlug)).Where(compiled).ToList();
        }

        public async Task<(IEnumerable<PostTag> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _context.PostTags.CountAsync();
            var entities = await _context.PostTags
                .OrderBy(t => t.TagName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
            return (entities.Select(t => PostTag.Rehydrate(t.TagId, t.TagName, t.TagSlug)), totalCount);
        }

        public void Update(PostTag domainEntity)
        {
            var entity = _context.PostTags.FirstOrDefault(t => t.TagId == domainEntity.Id);
            if (entity == null) return;
            entity.TagName = domainEntity.TagName;
            entity.TagSlug = domainEntity.TagSlug;
        }

        public async Task<bool> ExistsAsync(Expression<Func<PostTag, bool>> predicate)
        {
            var tags = await _context.PostTags.AsNoTracking().ToListAsync();
            var compiled = predicate.Compile();
            return tags.Select(t => PostTag.Rehydrate(t.TagId, t.TagName, t.TagSlug)).Any(compiled);
        }

        public async Task<PostTag?> GetBySlugAsync(string slug)
        {
            var entity = await _context.PostTags.AsNoTracking().FirstOrDefaultAsync(t => t.TagSlug == slug);
            return entity == null ? null : PostTag.Rehydrate(entity.TagId, entity.TagName, entity.TagSlug);
        }
    }
}