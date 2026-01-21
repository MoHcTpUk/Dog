using Identity.Application;
using Identity.Infrastructure;
using Microsoft.AspNetCore.DataProtection;
using OpenIddict.Abstractions;
using OpenIddict.Validation.AspNetCore;
using Shared.Api;

namespace Identity.WebApi;

public static class Extensions
{
    public static IServiceCollection AddIdentityWebApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        services.AddIdentityApplication(configuration);

        var dataProtectionKeysPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Dog",
            "DataProtection-Keys");
        Directory.CreateDirectory(dataProtectionKeysPath);

        services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath))
            .SetApplicationName("dog-app");

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
                    OpenIddictConstants.Scopes.OpenId,
                    OpenIddictConstants.Scopes.Email,
                    OpenIddictConstants.Scopes.Profile,
                    OpenIddictConstants.Scopes.Roles);

                options.AddDevelopmentEncryptionCertificate()
                    .AddDevelopmentSigningCertificate();

                options.UseReferenceRefreshTokens();

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