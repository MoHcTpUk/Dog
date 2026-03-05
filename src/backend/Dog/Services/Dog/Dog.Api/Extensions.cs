using Dog.Api.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Api;

namespace Dog.Api;

public static class Extensions
{
    public static IServiceCollection AddDogApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        services.AddScoped<IDogService, DogService>();
        services.AddScoped<IOwnerService, OwnerService>();

        return services;
    }
}
