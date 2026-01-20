using System.Security.Claims;
using System.Security.Cryptography;
using Identity.Api.Commands;
using Identity.Application.Services;
using Microsoft.Extensions.Configuration;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class GenerateTokenHandler(
    IIdentityService identityService,
    ITokenService tokenService,
    IOpenIddictTokenManager tokenManager,
    IOpenIddictApplicationManager applicationManager,
    IConfiguration configuration
) : ICommandHandler<GenerateTokenCommand, GenerateTokenResult>
{
    public async Task<GenerateTokenResult> Handle(GenerateTokenCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Проверяем учетные данные через IdentityService
            var user = await identityService.ValidateUserAsync(request.Email, request.Password, cancellationToken);
            if (user == null)
            {
                return new GenerateTokenResult
                {
                    Success = false,
                    ErrorMessage = "Invalid username or password"
                };
            }

            // Получаем scopes из запроса
            var scopes = request.Scope.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            // Создаем ClaimsPrincipal через IdentityService
            var claimsPrincipal = identityService.CreateClaimsPrincipal(user, scopes);

            // Устанавливаем правильную схему аутентификации для OpenIddict
            var identity = new ClaimsIdentity(
                claimsPrincipal.Claims,
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                OpenIddictConstants.Claims.Name,
                OpenIddictConstants.Claims.Role);

            claimsPrincipal = new ClaimsPrincipal(identity);
            claimsPrincipal.SetScopes(scopes);
            claimsPrincipal.SetResources(await tokenService.GetResourcesAsync(scopes));

            // Генерируем токен через TokenService
            var token = await tokenService.GenerateTokenAsync(claimsPrincipal, scopes, cancellationToken);
            
            if (!string.IsNullOrEmpty(token))
            {
                // Генерируем RefreshToken через OpenIddict
                string? refreshToken = null;
                try
                {
                    // Генерируем случайную строку для refresh token
                    var randomBytes = new byte[32];
                    using (var rng = RandomNumberGenerator.Create())
                    {
                        rng.GetBytes(randomBytes);
                    }
                    refreshToken = Convert.ToBase64String(randomBytes)
                        .Replace("+", "-")
                        .Replace("/", "_")
                        .Replace("=", "");

                    // Получаем ClientId из конфигурации и находим приложение
                    var clientId = configuration["OpenIddict:ClientId"];
                    string? applicationId = null;
                    if (!string.IsNullOrEmpty(clientId))
                    {
                        var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);
                        if (application != null)
                        {
                            applicationId = await applicationManager.GetIdAsync(application, cancellationToken);
                        }
                    }

                    var tokenDescriptor = new OpenIddictTokenDescriptor
                    {
                        Subject = user.Id.ToString(),
                        Type = OpenIddictConstants.TokenTypeHints.RefreshToken,
                        CreationDate = DateTimeOffset.UtcNow,
                        ExpirationDate = DateTimeOffset.UtcNow.AddDays(30), // 30 дней для refresh token
                        Status = OpenIddictConstants.Statuses.Valid,
                        Principal = claimsPrincipal,
                        ReferenceId = refreshToken, // Используем ReferenceId для хранения строкового значения
                        ApplicationId = applicationId // Привязываем токен к конкретному приложению
                    };
                    
                    await tokenManager.CreateAsync(tokenDescriptor, cancellationToken);
                }
                catch
                {
                    // Логируем ошибку, но не прерываем процесс, если refresh token не удалось создать
                    // AccessToken все равно будет возвращен
                    refreshToken = null;
                }

                return new GenerateTokenResult
                {
                    Success = true,
                    AccessToken = token,
                    RefreshToken = refreshToken,
                    TokenType = "Bearer",
                    ExpiresIn = 86400 // 24 часа
                };
            }

            return new GenerateTokenResult
            {
                Success = false,
                ErrorMessage = "Failed to generate token"
            };
        }
        catch (Exception ex)
        {
            return new GenerateTokenResult
            {
                Success = false,
                ErrorMessage = $"Error generating token: {ex.Message}"
            };
        }
    }
}
