using Dog.Application;
using Microsoft.Extensions.Hosting;
using Shared.Service;

namespace Dog.Service;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = HostBuilderHelper
            .CreateHostBuilder(args, (services, config) =>
            {
                services.AddDogApplication(config);
            }).Build();

        await host.RunAsync();
    }
}
