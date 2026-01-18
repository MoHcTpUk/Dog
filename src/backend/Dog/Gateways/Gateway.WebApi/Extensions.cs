using Identity.Api.Services;
using Identity.Infrastructure;
using OpenIddict.Abstractions;
using OpenIddict.Validation.AspNetCore;
using Shared.Api;

namespace Gateway.Api;

public static class Extensions
{
    public static IServiceCollection AddIdentityApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        // Регистрируем Identity.Application для доступа к сервисам
        // services.AddIdentityApplication(configuration);

        // Регистрируем Identity.Api.Services для работы через NATS
        services.AddScoped<Identity.Api.Services.IIdentityService, Identity.Api.Services.IdentityService>();
        services.AddScoped<Identity.Api.Services.ITokenService, Identity.Api.Services.TokenService>();

        services.AddIdentityInfrastructure(configuration);

        // Настройка OpenIddict
        services.AddOpenIddict()
            .AddCore(options =>
            {
                options.UseEntityFrameworkCore()
                    .UseDbContext<IdentityDbContext>();
            })
            .AddServer(options =>
            {
                options.SetTokenEndpointUris("/connect/token")
                    .SetUserinfoEndpointUris("/connect/userinfo");

                options.AllowPasswordFlow()
                    .AllowRefreshTokenFlow();

                options.RegisterScopes(
                    OpenIddictConstants.Scopes.Email,
                    OpenIddictConstants.Scopes.Profile,
                    OpenIddictConstants.Scopes.Roles);

                options.AddDevelopmentEncryptionCertificate()
                    .AddDevelopmentSigningCertificate();

                options.UseAspNetCore()
                    .EnableTokenEndpointPassthrough()
                    .EnableUserinfoEndpointPassthrough()
                    .DisableTransportSecurityRequirement();
            })
            .AddValidation(options =>
            {
                options.UseLocalServer();
                options.UseAspNetCore();
            });

        services.AddAuthentication(options =>
        {
            options.DefaultScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
        });

        services.AddAuthorization();

        return services;
    }
}