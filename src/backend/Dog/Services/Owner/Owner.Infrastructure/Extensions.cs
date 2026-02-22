using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Owner.Infrastructure.Repositories;
using Shared.Infrastructure;

namespace Owner.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddOwnerInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IOwnerRepository, OwnerRepository>();

        services.AddSharedInfrastructure();

        return services;
    }
}
