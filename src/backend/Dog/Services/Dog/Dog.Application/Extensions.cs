using Dog.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Application;

namespace Dog.Application;

public static class Extensions
{
    public static IServiceCollection AddDogApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDogInfrastructure(configuration);
        services.AddSharedApplication(configuration);

        return services;
    }
}