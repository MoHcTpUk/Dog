using Dog.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Shared.Enumeration;

namespace Dog.Infrastructure;

public class DogDbContext(DbContextOptions<DogDbContext> options) : DbContext(options)
{
    public DbSet<DogAggregate> Dogs { get; set; }
    
    public DbSet<OwnerAggregate> Owners { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DogAggregate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Weight).IsRequired();
            entity.Property(e => e.Birthdate).IsRequired();
            entity.Property(e => e.PhotoIds)
                .HasColumnType("uuid[]");
            entity.Property(e => e.Species)
                .HasConversion(
                    species => species.Value,
                    value => Species.FromValue(value))
                .IsRequired();
            entity.Property(e => e.OwnerId);
            entity.HasOne<OwnerAggregate>()
                .WithMany()
                .HasForeignKey(e => e.OwnerId)
                .IsRequired(false);
        });
        
        modelBuilder.Entity<OwnerAggregate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.Birthdate).IsRequired();
        });
    }
}
