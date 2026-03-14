using OpenIddict.Abstractions;

namespace Identity.WebApi;

internal sealed class AppInitializer(IServiceProvider serviceProvider, IConfiguration configuration)
    : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var applicationManager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();
        var clientId = configuration["OpenIddict:ClientId"] ?? "dog-app";
        var gatewayClientId = configuration["OpenIddict:GatewayClientId"] ?? "gateway-webapi";
        var gatewayClientSecret = configuration["OpenIddict:GatewayClientSecret"] ?? "gateway-webapi-secret";

        // Проверяем, существует ли клиент
        var existingClient = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);

        if (existingClient == null)
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

        var existingGatewayClient = await applicationManager.FindByClientIdAsync(gatewayClientId, cancellationToken);
        if (existingGatewayClient == null)
            await applicationManager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = gatewayClientId,
                ClientSecret = gatewayClientSecret,
                DisplayName = "Gateway WebApi",
                ClientType = OpenIddictConstants.ClientTypes.Confidential,
                Permissions =
                {
                    OpenIddictConstants.Permissions.Endpoints.Introspection
                }
            }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}