using Microsoft.Extensions.Hosting;
using Shared.Service;
using Users.Application;
using Users.Infrastructure;

namespace Users.Service;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = HostBuilderHelper
            .CreateHostBuilder(args, (services, config) =>
            {
                services.AddUsersApplication(config);
                services.AddUsersInfrastructure(config);
            }).Build();

        await host.RunAsync();
    }
}