using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Application;
using Users.Api.Services;
using Users.Application.Interfaces;
using Users.Application.Models.Keycloak;
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

    public static IServiceCollection AddKeycloakClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<KeycloakConfiguration>(configuration.GetSection("Keycloak"));

        services.AddHttpClient<IKeycloakClient, KeycloakClient>(client =>
        {
            var keycloakConfig = configuration.GetSection("Keycloak").Get<KeycloakConfiguration>();
            if (keycloakConfig == null) return;

            client.BaseAddress = new Uri($"{keycloakConfig.BaseUrl}/realms/{keycloakConfig.Realm}/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddScoped<IKeycloakClient, KeycloakClient>();

        return services;
    }
}