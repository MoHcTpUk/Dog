using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Shared.Service;

public static class HostBuilderHelper
{
    public static IHostBuilder CreateHostBuilder(string[] args,
        Action<IServiceCollection, IConfiguration> configureServices)
    {
        return Host.CreateDefaultBuilder(args)
            .ConfigureServices((context, services) =>
            {
                var configuration = context.Configuration;

                Console.WriteLine($"DOTNET_ENVIRONMENT: {configuration["DOTNET_ENVIRONMENT"]}");
                
                services.AddHostedService<AppInitializer>();

                configureServices?.Invoke(services, configuration);
            });
    }
}