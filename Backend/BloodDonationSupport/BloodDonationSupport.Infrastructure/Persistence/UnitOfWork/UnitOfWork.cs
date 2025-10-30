﻿using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Infrastructure.Persistence.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private  AppDbContext _context;
        private  IDbContextTransaction? _transaction;

        public UnitOfWork( AppDbContext context)
        {
            _context = context;
        }
        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if(_transaction != null)
            {
                await _transaction.CommitAsync();
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public IGenericRepository<TEntity> GetRepository<TEntity>() where TEntity : class
        {
            return new GenericRepository<TEntity>(_context);
        }

        public async Task RollbackTransactionAsync()
        {
            if(_transaction != null)
            {
                await _transaction.RollbackAsync();
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
