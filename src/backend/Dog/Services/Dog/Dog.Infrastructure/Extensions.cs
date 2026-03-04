using Dog.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Domain.Interfaces;
using Shared.Infrastructure;

namespace Dog.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddDogInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IDogRepository, DogRepository>();
        services.AddScoped<IOwnerRepository, OwnerRepository>();
        services.AddScoped<IDatabaseMigrator, EfCoreDatabaseMigrator<DogDbContext>>();
        
        services.AddSharedInfrastructure();

        return services;
    }
}
