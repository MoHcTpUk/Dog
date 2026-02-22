using Microsoft.Extensions.Hosting;
using Owner.Application;
using Shared.Service;

namespace Owner.Service;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = HostBuilderHelper
            .CreateHostBuilder(args, (services, config) =>
            {
                services.AddOwnerApplication(config);
            }).Build();

        await host.RunAsync();
    }
}
