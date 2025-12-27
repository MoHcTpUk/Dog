using System;
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
        })
        .ConfigurePrimaryHttpMessageHandler(() =>
        {
            var handler = new HttpClientHandler();
            
            // В Development/Local окружении или для локальных доменов игнорируем ошибки сертификата
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") 
                ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") 
                ?? "Production";
            
            var isDevelopment = environment == "Development" || 
                                environment == "Local" || 
                                environment.Equals("Development", StringComparison.OrdinalIgnoreCase) ||
                                environment.Equals("Local", StringComparison.OrdinalIgnoreCase);
            
            // Всегда разрешаем самоподписанные сертификаты для локальных доменов
            // (даже в Production, если это локальный домен)
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =>
            {
                if (message.RequestUri != null)
                {
                    var host = message.RequestUri.Host;
                    
                    // Разрешаем для локальных доменов
                    if (host.EndsWith(".dogappa.local", StringComparison.OrdinalIgnoreCase) ||
                        host.EndsWith(".local", StringComparison.OrdinalIgnoreCase) ||
                        host == "localhost" ||
                        host == "127.0.0.1" ||
                        host.StartsWith("127.", StringComparison.OrdinalIgnoreCase) ||
                        host == "::1")
                    {
                        return true;
                    }
                }
                
                // В Development/Local окружении разрешаем все ошибки сертификата
                if (isDevelopment)
                {
                    return true;
                }
                
                // Для остальных доменов используем стандартную проверку
                return errors == System.Net.Security.SslPolicyErrors.None;
            };
            
            return handler;
        });

        // IAuthentikClient уже зарегистрирован через AddHttpClient выше
        // services.AddScoped<IAuthentikClient, AuthentikClient>(); // Удалено - дублирование

        return services;
    }
}
