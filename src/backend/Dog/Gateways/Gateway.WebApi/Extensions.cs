using Identity.Api.Services;
using Shared.Api;

namespace Gateway.Api;

public static class Extensions
{
    public static IServiceCollection AddIdentityApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        // Регистрируем Identity.Api.Services для работы через NATS (для других операций, не связанных с токенами)
        services.AddScoped<IIdentityService, IdentityService>();

        return services;
    }
}