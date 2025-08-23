using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shared.Messaging.Messaging;
using DbContext = Microsoft.EntityFrameworkCore.DbContext;

namespace Shared.Service;

public class AppInitializer(IConfiguration configuration, ICommandBus bus) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await MigrateDatabaseAsync();
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

    private async Task MigrateDatabaseAsync()
    {
        var factoryInterfaceType = typeof(Infrastructure.IDbContextFactory<>);

        var factoryTypes = Utilities.GetTypes(factoryInterfaceType);

        foreach (var factoryType in factoryTypes)
        {
            var factory = (Infrastructure.IDbContextFactory<DbContext>)Activator.CreateInstance(factoryType)!;

            var dbContext = factory.CreateDbContext(configuration);

            await dbContext.Database.MigrateAsync();
        }
    }
}