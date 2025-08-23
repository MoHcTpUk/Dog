using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NATS.Client;
using Shared.Messaging.Messaging;

namespace Shared.Application;

public static class Extensions
{
    public static IServiceCollection AddSharedApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies()));

        services.RegisterAutoMapper();

        services.AddSingleton<ICommandBus, NatsCommandBus>();
        services.AddSingleton<IConnection>(_ =>
        {
            var connection = NatsConnectionFactory.Create(configuration);
            return connection;
        });
        return services;
    }

    private static IServiceCollection RegisterAutoMapper(this IServiceCollection services)
    {
        var profiles = AppDomain
            .CurrentDomain
            .GetAssemblies()
            .SelectMany(assembly => assembly.GetTypes())
            .Where(type =>
                typeof(BaseMappingProfile).IsAssignableFrom(type) && type is { IsAbstract: false, IsClass: true })
            .ToList();

        var mapperConfig = new MapperConfiguration(cfg =>
        {
            foreach (var profile in profiles) cfg.AddProfile((Profile)Activator.CreateInstance(profile)!);
        });

        var mapper = mapperConfig.CreateMapper();
        services.AddSingleton(mapper);

        return services;
    }
}