using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Owner.Infrastructure;
using Shared.Application;

namespace Owner.Application;

public static class Extensions
{
    public static IServiceCollection AddOwnerApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOwnerInfrastructure(configuration);
        services.AddSharedApplication(configuration);

        return services;
    }
}
