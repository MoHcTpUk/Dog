using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Identity.Application.Services;

public class TokenService(
    IConfiguration configuration,
    IIdentityService identityService,
    IOpenIddictTokenManager tokenManager) : ITokenService
{
    public async Task<string?> GenerateTokenAsync(ClaimsPrincipal principal, IEnumerable<string> scopes,
        CancellationToken cancellationToken)
    {
        // OpenIddict генерирует JWT токен через SignIn, который работает в HTTP контексте
        // Для программной генерации используем упрощенный подход - создаем JWT вручную
        // Используем тот же signing key, что и OpenIddict

        try
        {
            // Получаем signing key из конфигурации
            var signingKey = configuration["OpenIddict:SigningKey"] ??
                             "your-secret-signing-key-change-in-production-minimum-32-characters";

            // Создаем signing credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Создаем claims для токена
            var claims = new List<Claim>();
            if (principal.Identity is ClaimsIdentity identity) claims.AddRange(identity.Claims);

            // Добавляем стандартные claims для JWT
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = credentials,
                Issuer = "dog-app",
                Audience = "dog-app"
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return await Task.FromResult(tokenString);
        }
        catch
        {
            return null;
        }
    }

    public async Task<ClaimsPrincipal?> CreateClaimsPrincipalForPasswordGrantAsync(
        string username,
        string password,
        IEnumerable<string> scopes,
        CancellationToken cancellationToken)
    {
        var user = await identityService.ValidateUserAsync(username, password, cancellationToken);
        if (user == null) return null;

        var claimsPrincipal = identityService.CreateClaimsPrincipal(user, scopes);

        // Устанавливаем правильную схему аутентификации для OpenIddict
        var identity = new ClaimsIdentity(
            claimsPrincipal.Claims,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        var principal = new ClaimsPrincipal(identity);
        principal.SetScopes(scopes);
        principal.SetResources(await GetResourcesAsync(scopes));

        return principal;
    }

    public async Task<(ClaimsPrincipal? Principal, object? Token)> CreateClaimsPrincipalForRefreshTokenAsync(
        string refreshToken,
        IEnumerable<string> requestedScopes,
        CancellationToken cancellationToken)
    {
        // Находим токен по ReferenceId
        var token = await tokenManager.FindByReferenceIdAsync(refreshToken, cancellationToken);
        if (token == null) return (null, null);

        // Проверяем тип токена
        var tokenType = await tokenManager.GetTypeAsync(token, cancellationToken);
        if (tokenType != OpenIddictConstants.TokenTypeHints.RefreshToken) return (null, token);

        // Проверяем статус токена
        var status = await tokenManager.GetStatusAsync(token, cancellationToken);
        if (status != OpenIddictConstants.Statuses.Valid) return (null, token);

        // Проверяем срок действия
        var expirationDate = await tokenManager.GetExpirationDateAsync(token, cancellationToken);
        if (expirationDate.HasValue && expirationDate.Value < DateTimeOffset.UtcNow) return (null, token);

        // Получаем информацию о пользователе из токена
        var subject = await tokenManager.GetSubjectAsync(token, cancellationToken);
        if (string.IsNullOrEmpty(subject)) return (null, token);

        // Получаем пользователя по ID
        var userId = Guid.Parse(subject);
        var user = await identityService.GetUserByIdAsync(userId, cancellationToken);
        if (user == null) return (null, token);

        // Получаем scopes из запроса или используем стандартные
        var scopes = requestedScopes.Any()
            ? requestedScopes.ToArray()
            : [OpenIddictConstants.Scopes.OpenId, OpenIddictConstants.Scopes.Profile, OpenIddictConstants.Scopes.Email];

        var claimsPrincipal = identityService.CreateClaimsPrincipal(user, scopes);

        // Устанавливаем правильную схему аутентификации для OpenIddict
        var identity = new ClaimsIdentity(
            claimsPrincipal.Claims,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        var principal = new ClaimsPrincipal(identity);
        principal.SetScopes((IEnumerable<string>)scopes);
        principal.SetResources(await GetResourcesAsync(scopes));

        return (principal, token);
    }

    public async Task<IEnumerable<string>> GetResourcesAsync(IEnumerable<string> scopes)
    {
        // Возвращаем ресурсы на основе scopes
        return await Task.FromResult(scopes);
    }
}