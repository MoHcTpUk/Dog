using Identity.Application;
using Identity.Infrastructure;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Validation.AspNetCore;
using Shared.Api;
using Users.Api.Services;

namespace Identity.WebApi;

public static class Extensions
{
    public static IServiceCollection AddIdentityWebApi(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSharedApi(configuration);

        services.AddIdentityInfrastructure(configuration);
        services.AddIdentityApplication(configuration);
        
        // Identity.WebApi уже регистрирует Shared.Api (NATS + CommandBus).
        // Поэтому Users.Api подключаем только как сервисы поверх CommandBus, без повторного AddSharedApi().
        services.AddScoped<IUserService, UserService>();

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
                var openIddictIssuer = configuration["OpenIddict:Issuer"] ?? "http://identity-webapi:8080/";

                options.SetIssuer(new Uri(openIddictIssuer));
                options.SetTokenEndpointUris("/connect/token")
                    .SetUserinfoEndpointUris("/connect/userinfo")
                    .SetIntrospectionEndpointUris("/connect/introspect");

                options.AllowPasswordFlow()
                    .AllowRefreshTokenFlow();

                options.DisableAccessTokenEncryption();

                options.RegisterScopes(
                    OpenIddictConstants.Scopes.OpenId,
                    OpenIddictConstants.Scopes.Email,
                    OpenIddictConstants.Scopes.Profile,
                    OpenIddictConstants.Scopes.Roles);

                options.AddDevelopmentSigningCertificate();

                var signingSecret = configuration["OpenIddict:SigningKey"];
                if (!string.IsNullOrWhiteSpace(signingSecret))
                {
                    var keyBytes = Encoding.UTF8.GetBytes(signingSecret);

                    options.AddEncryptionKey(new SymmetricSecurityKey(SHA256.HashData(keyBytes)));
                }
                else
                {
                    options.AddDevelopmentEncryptionCertificate();
                }

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