using Microsoft.EntityFrameworkCore;
using Users.Domain.Aggregates;

namespace Users.Infrastructure;

public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
{
    public DbSet<UserAggregate> Users { get; set; }

    public DbSet<AuthRequest> AuthRequest { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAggregate>(entity => { entity.HasKey(e => e.Id); });
        modelBuilder.Entity<AuthRequest>(entity => { entity.HasKey(e => e.Id); });
    }
}