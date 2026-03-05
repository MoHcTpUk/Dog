using Identity.Contracts.Services;
using Identity.Api;
using Identity.Api.Services;
using Shared.Api;

namespace Gateway.Api;

public static class Extensions
{
    public static IServiceCollection AddIdentityApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        services.AddScoped<IIdentityService, IdentityService>();

        return services;
    }
}