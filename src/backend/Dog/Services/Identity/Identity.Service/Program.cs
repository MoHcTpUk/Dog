using Microsoft.Extensions.Hosting;
using Shared.Service;
using Identity.Application;
using Identity.Infrastructure;

namespace Identity.Service;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = HostBuilderHelper
            .CreateHostBuilder(args, (services, config) =>
            {
                services.AddIdentityInfrastructure(config);
                services.AddIdentityApplication(config);
            }).Build();

        await host.RunAsync();
    }
}
