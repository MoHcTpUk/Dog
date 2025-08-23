using Microsoft.EntityFrameworkCore;
using Shared.Domain;
using Shared.Domain.Interfaces;

namespace Shared.Infrastructure.Repository;

public abstract class AbstractRepository<TEntity, TContext>(TContext context) : IRepository<TEntity>
    where TEntity : class, IBaseModel
    where TContext : DbContext
{
    private readonly DbContext _context = context;

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    public IQueryable<TEntity> AsQueryable()
    {
        return _context.Set<TEntity>();
    }

    public async Task<TEntity?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.FindAsync<TEntity>(id, cancellationToken);
    }

    public async Task<IList<TEntity>> CreateAsync(IList<TEntity> entities, CancellationToken cancellationToken)
    {
        await _context.Set<TEntity>().AddRangeAsync(entities, cancellationToken);

        return entities;
    }

    public IList<TEntity> UpdateAsync(IList<TEntity> entities)
    {
        _context.Set<TEntity>().UpdateRange(entities);

        return entities;
    }

    public IList<TEntity> DeleteAsync(IList<TEntity> entities)
    {
        _context.Set<TEntity>().RemoveRange(entities);

        return entities;
    }
}