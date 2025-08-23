using Shared.Api.Services;
using Shared.Api.Storages;

namespace Shared.Api;

public static class Extensions
{
    public static IServiceCollection AddSharedWebApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddSingleton<IStorage, MiniIoStorage>();

        return services;
    }
}