using System.Security.Claims;
using System.Security.Cryptography;
using Identity.Api.Commands;
using Identity.Application.Services;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class GenerateTokenHandler(
    IIdentityService identityService,
    ITokenService tokenService,
    IOpenIddictTokenManager tokenManager
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

            // Создаем claims для пользователя
            var identity = new ClaimsIdentity(
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                OpenIddictConstants.Claims.Name,
                OpenIddictConstants.Claims.Role);

            identity.AddClaim(new Claim(OpenIddictConstants.Claims.Subject, user.Id.ToString()));
            identity.AddClaim(new Claim(OpenIddictConstants.Claims.Email, user.Email));
            identity.AddClaim(new Claim(OpenIddictConstants.Claims.Name, user.UserName));
            identity.AddClaim(new Claim(OpenIddictConstants.Claims.PreferredUsername, user.UserName));

            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Устанавливаем scopes
            var scopes = request.Scope.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            claimsPrincipal.SetScopes(scopes);
            claimsPrincipal.SetResources(scopes);

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

                    var tokenDescriptor = new OpenIddictTokenDescriptor
                    {
                        Subject = user.Id.ToString(),
                        Type = OpenIddictConstants.TokenTypeHints.RefreshToken,
                        CreationDate = DateTimeOffset.UtcNow,
                        ExpirationDate = DateTimeOffset.UtcNow.AddDays(30), // 30 дней для refresh token
                        Status = OpenIddictConstants.Statuses.Valid,
                        Principal = claimsPrincipal,
                        ReferenceId = refreshToken // Используем ReferenceId для хранения строкового значения
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
