using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Application;
using Users.Api.Services;
using Users.Application.Interfaces;
using Users.Application.Models.Authentik;
using Users.Application.Services;
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

    public static IServiceCollection AddAuthentikClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AuthentikConfiguration>(configuration.GetSection("Authentik"));

        services.AddHttpClient<IAuthentikClient, AuthentikClient>(client =>
        {
            var authentikConfig = configuration.GetSection("Authentik").Get<AuthentikConfiguration>();
            if (authentikConfig == null) return;

            client.BaseAddress = new Uri(authentikConfig.BaseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddScoped<IAuthentikClient, AuthentikClient>();

        return services;
    }
}
