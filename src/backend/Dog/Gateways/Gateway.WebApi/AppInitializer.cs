using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using OpenIddict.Abstractions;

namespace Gateway.Api;

internal sealed class AppInitializer : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;

    public AppInitializer(IServiceProvider serviceProvider, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var applicationManager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();
        var clientId = _configuration["OpenIddict:ClientId"] ?? "dog-app";

        // Проверяем, существует ли клиент
        var existingClient = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);
        
        if (existingClient == null)
        {
            // Создаем нового клиента
            await applicationManager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = clientId,
                DisplayName = "Dog App",
                ClientType = OpenIddictConstants.ClientTypes.Public, // Public client для мобильных приложений
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Token,
                    OpenIddictConstants.Permissions.GrantTypes.Password,
                    OpenIddictConstants.Permissions.GrantTypes.RefreshToken,
                    "scp:openid",
                    "scp:email",
                    "scp:profile",
                    "scp:roles"
                }
            }, cancellationToken);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}