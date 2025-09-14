using Microsoft.EntityFrameworkCore;
using Users.Domain.Aggregates;

namespace Users.Infrastructure;

public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
{
    public DbSet<UserAggregate> Users { get; set; }

    public DbSet<RegistrationRequest> RegistrationRequest { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAggregate>(entity => { entity.HasKey(e => e.Id); });
        modelBuilder.Entity<RegistrationRequest>(entity => { entity.HasKey(e => e.Id); });
    }
}