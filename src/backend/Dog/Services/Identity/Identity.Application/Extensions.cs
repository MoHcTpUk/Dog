using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Application;
using Identity.Application.Services;

namespace Identity.Application;

public static class Extensions
{
    public static IServiceCollection AddIdentityApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        
        services.AddSharedApplication(configuration);

        return services;
    }
}
