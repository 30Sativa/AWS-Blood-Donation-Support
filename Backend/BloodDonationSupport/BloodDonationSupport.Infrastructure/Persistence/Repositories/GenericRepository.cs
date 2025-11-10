using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BloodDonationSupport.Infrastructure.Persistence.Repositories
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<TEntity> _dbset;

        public GenericRepository(AppDbContext context)
        {
            _context = context;
            _dbset = _context.Set<TEntity>();
        }

        public virtual async Task AddAsync(TEntity entity)
        {
            await _dbset.AddAsync(entity);
        }

        public virtual void Delete(TEntity entity)
        {
            _dbset.Remove(entity);
        }

        public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _dbset.AnyAsync(predicate);
        }

        public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _dbset.AsNoTracking().Where(predicate).ToListAsync();
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbset.AsNoTracking().ToListAsync();
        }

        public virtual async Task<(IEnumerable<TEntity> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _dbset.CountAsync();
            var items = await _dbset
                .AsNoTracking()
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return (items, totalCount);
        }

        public virtual async Task<TEntity?> GetByIdAsync(object id)
        {
            return await _dbset.FindAsync(id);
        }

        public virtual void Update(TEntity entity)
        {
            _dbset.Update(entity);
        }
    }
}