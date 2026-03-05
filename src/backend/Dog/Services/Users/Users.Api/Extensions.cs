using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Api;
using Users.Api.Services;

namespace Users.Api;

public static class Extensions
{
    public static IServiceCollection AddUsersApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);
        
        services.AddScoped<IUserService, UserService>();
 
        return services;
    }
}