using Microsoft.EntityFrameworkCore;

namespace Shared.Infrastructure;

public abstract class BaseDbContext(DbContextOptions options) : DbContext(options)
{
    protected sealed override void OnModelCreating(ModelBuilder modelBuilder)
    {
        OnModelCreatingInternal(modelBuilder);
    }

    protected abstract void OnModelCreatingInternal(ModelBuilder modelBuilder);
}