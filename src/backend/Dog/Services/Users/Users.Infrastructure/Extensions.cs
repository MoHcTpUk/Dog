using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Infrastructure;
using Users.Infrastructure.Repositories;

namespace Users.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddUsersInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IUserRepository, UserRepository>();

        services.AddSharedInfrastructure();

        return services;
    }
}