using System.Net.Sockets;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Polly;

namespace Shared.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services)
    {
        AddDbContexts(services);
        
        return services;
    }

    private static IServiceCollection AddDbContexts(this IServiceCollection services)
    {
        var factoryInterfaceType = typeof(IDbContextFactory<>);
        var factoryTypes =
            Utilities.GetTypes(factoryInterfaceType);

        foreach (var factoryType in factoryTypes)
        {
            var interfaceType = factoryType.GetInterfaces()
                .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == factoryInterfaceType);

            var contextType = interfaceType.GetGenericArguments()[0];

            var addDbContextMethod = typeof(EntityFrameworkServiceCollectionExtensions)
                .GetMethods(BindingFlags.Static | BindingFlags.Public)
                .First(m => m is { Name: "AddDbContext", IsGenericMethod: true }
                            && m.GetParameters().Length >= 2
                            && m.GetParameters()[1].ParameterType.IsGenericType
                            && m.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(Action<,>));

            var genericMethod = addDbContextMethod.MakeGenericMethod(contextType);

            var configureMethod = typeof(Extensions)
                .GetMethod(nameof(ConfigureDbContext), BindingFlags.NonPublic | BindingFlags.Static)!;

            var configureDelegateType = typeof(Action<,>).MakeGenericType(
                typeof(IServiceProvider),
                typeof(DbContextOptionsBuilder)
            );

            var configureDelegate = Delegate.CreateDelegate(configureDelegateType, configureMethod);

            genericMethod.Invoke(null, [services, configureDelegate, null, null]);
        }

        return services;
    }

    private static void ConfigureDbContext(IServiceProvider provider,
        DbContextOptionsBuilder options)
    {
        var configuration = provider.GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var policy = Policy
            .Handle<NpgsqlException>()
            .Or<SocketException>()
            .WaitAndRetry(10, retryAttempt => TimeSpan.FromSeconds(5));

        policy.Execute(() => { options.UseNpgsql(connectionString); });
    }
}