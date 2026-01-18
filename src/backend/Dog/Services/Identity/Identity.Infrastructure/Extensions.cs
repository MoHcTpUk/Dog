using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Infrastructure;
using Identity.Infrastructure.Repositories;

namespace Identity.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddIdentityInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IApplicationUserRepository, ApplicationUserRepository>();
        
        services.AddSharedInfrastructure();

        return services;
    }
}
