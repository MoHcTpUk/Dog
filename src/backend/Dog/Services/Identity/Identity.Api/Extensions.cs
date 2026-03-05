using Identity.Api.Services;
using Identity.Contracts.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Api;

public static class Extensions
{
    public static IServiceCollection AddIdentityApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IIdentityService, IdentityService>();

        return services;
    }
}