using Identity.Api;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Application;
using Users.Api.Services;

namespace Users.Application;

public static class Extensions
{
    public static IServiceCollection AddUsersApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IUserService, UserService>();

        services.AddIdentityApi(configuration);
        services.AddSharedApplication(configuration);

        return services;
    }
}