using Microsoft.Extensions.Hosting;
using Shared.Service;
using Users.Application;

namespace Users.Service;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = HostBuilderHelper
            .CreateHostBuilder(args, (services, config) =>
            {
                services.AddUsersApplication(config);
                services.AddAuthentikClient(config);
            }).Build();

        await host.RunAsync();
    }
}