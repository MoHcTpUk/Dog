using AutoMapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NATS.Client;
using Shared.Messaging.Messaging;
using Shared.Application.Validation;

namespace Shared.Application;

public static class Extensions
{
    public static IServiceCollection AddSharedApplication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies()));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DataAnnotationsValidationBehavior<,>));

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

        services.AddAutoMapper(cfg =>
        {
            foreach (var profile in profiles) cfg.AddProfile((Profile)Activator.CreateInstance(profile)!);
        });

        return services;
    }
}