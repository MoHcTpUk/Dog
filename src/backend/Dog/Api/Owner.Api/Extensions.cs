using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Owner.Api.Services;
using Shared.Api;

namespace Owner.Api;

public static class Extensions
{
    public static IServiceCollection AddOwnerApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        services.AddScoped<IOwnerService, OwnerService>();

        return services;
    }
}
