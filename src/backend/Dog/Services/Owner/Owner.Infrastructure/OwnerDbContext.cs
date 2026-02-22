using Microsoft.EntityFrameworkCore;
using Owner.Domain.Aggregates;

namespace Owner.Infrastructure;

public class OwnerDbContext(DbContextOptions<OwnerDbContext> options) : DbContext(options)
{
    public DbSet<OwnerAggregate> Owners { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OwnerAggregate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Birthdate).IsRequired();
        });
    }
}
