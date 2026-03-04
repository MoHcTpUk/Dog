using Microsoft.EntityFrameworkCore;
using Shared.Domain.Interfaces;

namespace Shared.Infrastructure;

public sealed class EfCoreDatabaseMigrator<TContext>(TContext dbContext) : IDatabaseMigrator
    where TContext : DbContext
{
    public Task MigrateAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.Database.MigrateAsync(cancellationToken);
    }
}
