using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Shared.Application;
using Users.Api.Services;
using Users.Infrastructure;

namespace Users.Application;

public static class Extensions
{
    public static IServiceCollection AddUsersApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IUserService, UserService>();
        
        services.AddUsersInfrastructure(configuration);
        services.AddSharedApplication(configuration);

        return services;
    }
}