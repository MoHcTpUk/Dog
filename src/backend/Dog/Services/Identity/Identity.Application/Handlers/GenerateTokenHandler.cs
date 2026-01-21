using System.Security.Claims;
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

            // Генерируем access token через TokenService
            var accessToken = await tokenService.GenerateTokenAsync(claimsPrincipal, scopes, cancellationToken);
            
            if (!string.IsNullOrEmpty(accessToken))
            {
                // Генерируем RefreshToken через OpenIddict
                string? refreshToken = null;
                try
                {
                    // Получаем ClientId из конфигурации и находим приложение
                    var clientId = configuration["OpenIddict:ClientId"] ?? "dog-app";
                    string? applicationId = null;
                    var application = await applicationManager.FindByClientIdAsync(clientId, cancellationToken);
                    if (application != null)
                    {
                        applicationId = await applicationManager.GetIdAsync(application, cancellationToken);
                    }

                    // Создаем refresh token descriptor с полным Principal
                    // OpenIddict автоматически сгенерирует ReferenceId, если включен UseReferenceRefreshTokens()
                    var tokenDescriptor = new OpenIddictTokenDescriptor
                    {
                        Subject = user.Id.ToString(),
                        Type = OpenIddictConstants.TokenTypeHints.RefreshToken,
                        CreationDate = DateTimeOffset.UtcNow,
                        ExpirationDate = DateTimeOffset.UtcNow.AddDays(30), // 30 дней для refresh token
                        Status = OpenIddictConstants.Statuses.Valid,
                        Principal = claimsPrincipal,
                        ApplicationId = applicationId
                    };
                    
                    // Создаем токен через OpenIddict Token Manager
                    // OpenIddict автоматически сериализует Principal в Payload
                    var tokenObject = await tokenManager.CreateAsync(tokenDescriptor, cancellationToken);
                    
                    // UseReferenceRefreshTokens() работает автоматически только для SignIn flow
                    // При ручном создании используем ReferenceId если есть, иначе - ID токена
                    refreshToken = await tokenManager.GetReferenceIdAsync(tokenObject, cancellationToken);
                    
                    // Если ReferenceId null (нет автоматической генерации), используем ID токена
                    if (string.IsNullOrEmpty(refreshToken))
                    {
                        refreshToken = await tokenManager.GetIdAsync(tokenObject, cancellationToken);
                    }
                }
                catch (Exception ex)
                {
                    // Логируем ошибку, но не прерываем процесс, если refresh token не удалось создать
                    // AccessToken все равно будет возвращен
                    Console.WriteLine($"Failed to create refresh token: {ex.Message}");
                    refreshToken = null;
                }

                return new GenerateTokenResult
                {
                    Success = true,
                    AccessToken = accessToken,
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
