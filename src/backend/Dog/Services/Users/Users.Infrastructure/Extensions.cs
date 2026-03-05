using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shared.Domain.Interfaces;
using Shared.Infrastructure;
using Users.Application.Interfaces;
using Users.Infrastructure.Repositories;

namespace Users.Infrastructure;

public static class Extensions
{
    public static IServiceCollection AddUsersInfrastructure(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRegistrationRequestRepository, RegistrationRequestRepository>();
        services.AddScoped<IDatabaseMigrator, EfCoreDatabaseMigrator<UserDbContext>>();

        services.AddSharedInfrastructure();

        return services;
    }
}