using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenIddict.Abstractions;
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

        // Регистрация OpenIddict Core для доступа к IOpenIddictTokenManager
        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<IdentityDbContext>();
            });

        return services;
    }
}
