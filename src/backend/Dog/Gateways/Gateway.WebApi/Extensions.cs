using Shared.Api;

namespace Gateway.Api;

public static class Extensions
{
    public static IServiceCollection AddIdentityApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedWebApi(configuration);

        return services;
    }
}