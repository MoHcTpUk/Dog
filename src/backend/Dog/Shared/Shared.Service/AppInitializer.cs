using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shared.Domain.Interfaces;
using Shared.Messaging.Messaging;

namespace Shared.Service;

public class AppInitializer(
    IConfiguration configuration,
    ICommandBus bus,
    IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await MigrateDatabaseAsync(cancellationToken);
        RegisterNatsStreamsAsync(bus, configuration);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private static void RegisterNatsStreamsAsync(ICommandBus bus, IConfiguration configuration)
    {
        var streams = configuration.GetSection("NatsStreams").Get<string[]>();

        streams?.ToList().ForEach(stream => bus.RegisterHandler($"{stream}.>"));
    }

    private async Task MigrateDatabaseAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var migrators = scope.ServiceProvider.GetServices<IDatabaseMigrator>();
        foreach (var migrator in migrators)
        {
            await migrator.MigrateAsync(cancellationToken);
        }
    }
}