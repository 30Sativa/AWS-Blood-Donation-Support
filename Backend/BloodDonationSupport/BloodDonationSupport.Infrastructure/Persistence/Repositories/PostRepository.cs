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

        public async Task<(IEnumerable<Post> Items, int TotalCount)> SearchAsync(
            string? keyword,
            string? tagSlug,
            bool? isPublished,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Posts
                .Include(p => p.Tags)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalized = keyword.Trim().ToLower();
                query = query.Where(p =>
                    EF.Functions.Like(p.Title.ToLower(), $"%{normalized}%") ||
                    (p.Excerpt != null && EF.Functions.Like(p.Excerpt.ToLower(), $"%{normalized}%")) ||
                    EF.Functions.Like(p.Content.ToLower(), $"%{normalized}%"));
            }

            if (!string.IsNullOrWhiteSpace(tagSlug))
            {
                var normalizedTag = tagSlug.Trim().ToLower();
                query = query.Where(p => p.Tags.Any(t => t.TagSlug == normalizedTag));
            }

            if (isPublished.HasValue)
            {
                query = query.Where(p => p.IsPublished == isPublished.Value);
            }

            var totalCount = await query.CountAsync();
            var entities = await query
                .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (entities.Select(MapToDomain), totalCount);
        }

        public async Task<(IEnumerable<Post> Items, int TotalCount)> GetPublishedPagedAsync(
            int pageNumber,
            int pageSize,
            string? tagSlug)
        {
            var query = _context.Posts
                .Include(p => p.Tags)
                .Where(p => p.IsPublished)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(tagSlug))
            {
                var normalized = tagSlug.Trim().ToLower();
                query = query.Where(p => p.Tags.Any(t => t.TagSlug == normalized));
            }

            var totalCount = await query.CountAsync();
            var entities = await query
                .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return (entities.Select(MapToDomain), totalCount);
        }

        public async Task<Post?> GetPublishedBySlugAsync(string slug)
        {
            var entity = await _context.Posts
                .Include(p => p.Tags)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

            return entity == null ? null : MapToDomain(entity);
        }

        public async Task<bool> IsTagUsedAsync(int tagId)
        {
            return await _context.Posts.AnyAsync(p => p.Tags.Any(t => t.TagId == tagId));
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