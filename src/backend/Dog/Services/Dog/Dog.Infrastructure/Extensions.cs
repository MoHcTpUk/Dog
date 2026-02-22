using Dog.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Infrastructure;

namespace Dog.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddDogInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IDogRepository, DogRepository>();

        services.AddSharedInfrastructure();

        return services;
    }
}
