using Shared.Domain;
using Shared.Domain.Interfaces;

namespace Shared.Infrastructure.Repository;

public interface IRepository<TEntity>
    where TEntity : IBaseModel
{
    public IQueryable<TEntity> AsQueryable();
    public Task<TEntity?> GetAsync(Guid id, CancellationToken cancellationToken);
    public Task<IList<TEntity>> CreateAsync(IList<TEntity> entities, CancellationToken cancellationToken);
    public IList<TEntity> UpdateAsync(IList<TEntity> entities);
    public IList<TEntity> DeleteAsync(IList<TEntity> entities);
    public Task SaveChangesAsync();
}