using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Domain.Posts.Entities;
using BloodDonationSupport.Domain.Posts.ValueObjects;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Post domainEntity)
        {
            var entity = new Models.Post
            {
                Title = domainEntity.Title.Value,
                Slug = domainEntity.Slug.Value,
                Content = domainEntity.Content,
                Excerpt = domainEntity.Excerpt,
                AuthorId = domainEntity.AuthorId,
                IsPublished = domainEntity.IsPublished,
                CreatedAt = domainEntity.CreatedAt,
                PublishedAt = domainEntity.PublishedAt
            };

            await _context.Posts.AddAsync(entity);
        }

        public void Delete(Post domainEntity)
        {
            var entity = _context.Posts.FirstOrDefault(p => p.PostId == domainEntity.Id);
            if (entity != null)
                _context.Posts.Remove(entity);
        }

        public async Task<bool> ExistsAsync(Expression<Func<Post, bool>> predicate)
        {
            // Domain expressions cannot be translated to EF; evaluate in-memory
            var posts = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .ToListAsync();

            var compiled = predicate.Compile();
            return posts.Select(MapToDomain).Any(compiled);
        }

        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            var entities = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .ToListAsync();

            return entities.Select(MapToDomain);
        }

        public async Task<(IEnumerable<Post> Items, int TotalCount)> GetPagedWithTagsAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _context.Posts.CountAsync();

            var posts = await _context.Posts
                .Include(p => p.Tags)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (posts.Select(MapToDomain), totalCount);
        }

        public async Task<(IEnumerable<Post> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _context.Posts.CountAsync();

            var posts = await _context.Posts
                .Include(p => p.Tags)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (posts.Select(MapToDomain), totalCount);
        }

        public async Task<Post?> GetByIdAsync(object id)
        {
            if (id is not long postId)
                return null;

            var entity = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PostId == postId);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<Post?> GetBySlugAsync(string slug)
        {
            var entity = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Slug == slug);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<IEnumerable<Post>> GetAllWithTagsAsync()
        {
            var entities = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .ToListAsync();

            return entities.Select(MapToDomain);
        }

        public async Task<IEnumerable<Post>> FindAsync(Expression<Func<Post, bool>> predicate)
        {
            // Evaluate domain predicate after mapping
            var entities = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .ToListAsync();

            var compiled = predicate.Compile();
            return entities.Select(MapToDomain).Where(compiled).ToList();
        }

        public void Update(Post domainEntity)
        {
            var entity = _context.Posts.FirstOrDefault(p => p.PostId == domainEntity.Id);
            if (entity == null) return;

            entity.Title = domainEntity.Title.Value;
            entity.Slug = domainEntity.Slug.Value;
            entity.Content = domainEntity.Content;
            entity.Excerpt = domainEntity.Excerpt;
            entity.IsPublished = domainEntity.IsPublished;
            entity.PublishedAt = domainEntity.PublishedAt;
        }

        // 🔧 Helper: map EF entity -> Domain
        private static Post MapToDomain(Models.Post entity)
        {
            var tags = entity.Tags.Select(t => PostTag.Rehydrate(t.TagId, t.TagName, t.TagSlug)).ToList();

            return Post.RehydrateWithTags(
                entity.PostId,
                new PostTitle(entity.Title),
                new PostSlug(entity.Slug),
                entity.Content,
                entity.Excerpt,
                entity.AuthorId,
                entity.IsPublished,
                entity.CreatedAt,
                entity.PublishedAt,
                tags
            );
        }
    }
}