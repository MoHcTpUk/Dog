using Dog.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;

namespace Dog.Infrastructure;

public class DogDbContext(DbContextOptions<DogDbContext> options) : DbContext(options)
{
    public DbSet<DogAggregate> Dogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DogAggregate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Weight).IsRequired();
            entity.Property(e => e.Birthdate).IsRequired();
        });
    }
}
