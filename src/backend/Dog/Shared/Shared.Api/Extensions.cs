using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NATS.Client;
using Shared.Messaging.Messaging;

namespace Shared.Api;

public static class Extensions
{
    public static IServiceCollection AddSharedApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<ICommandBus, NatsCommandBus>();
        services.AddSingleton<IConnection>(_ =>
        {
            var connection = NatsConnectionFactory.Create(configuration);
            return connection;
        });
        return services;
    }
}