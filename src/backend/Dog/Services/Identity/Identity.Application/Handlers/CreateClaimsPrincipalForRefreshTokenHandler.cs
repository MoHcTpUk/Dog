using Identity.Api.Commands;
using Identity.Application.Services;
using OpenIddict.Abstractions;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class CreateClaimsPrincipalForRefreshTokenHandler(
    IIdentityService identityService,
    IOpenIddictTokenManager tokenManager
) : ICommandHandler<CreateClaimsPrincipalForRefreshTokenCommand, CreateClaimsPrincipalResult>
{
    public async Task<CreateClaimsPrincipalResult> Handle(
        CreateClaimsPrincipalForRefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        // Сначала пытаемся найти токен по ReferenceId (для reference tokens)
        var token = await tokenManager.FindByReferenceIdAsync(request.RefreshToken, cancellationToken);
        
        // Если не найден по ReferenceId, пытаемся найти по ID (для обычных токенов)
        if (token == null)
        {
            token = await tokenManager.FindByIdAsync(request.RefreshToken, cancellationToken);
        }
        
        if (token == null)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Invalid refresh token"
            };
        }

        // Проверяем тип токена
        var tokenType = await tokenManager.GetTypeAsync(token, cancellationToken);
        if (tokenType != OpenIddictConstants.TokenTypeHints.RefreshToken)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Invalid token type"
            };
        }

        // Проверяем статус токена
        var status = await tokenManager.GetStatusAsync(token, cancellationToken);
        if (status != OpenIddictConstants.Statuses.Valid)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Refresh token is no longer valid"
            };
        }

        // Проверяем срок действия
        var expirationDate = await tokenManager.GetExpirationDateAsync(token, cancellationToken);
        if (expirationDate.HasValue && expirationDate.Value < DateTimeOffset.UtcNow)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Refresh token has expired"
            };
        }

        // Получаем информацию о пользователе из токена
        var subject = await tokenManager.GetSubjectAsync(token, cancellationToken);
        if (string.IsNullOrEmpty(subject))
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "Invalid token subject"
            };
        }

        // Получаем пользователя по ID
        var userId = Guid.Parse(subject);
        var user = await identityService.GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            return new CreateClaimsPrincipalResult
            {
                Success = false,
                ErrorMessage = "User not found"
            };
        }

        // Получаем scopes из запроса или используем стандартные
        var scopes = request.RequestedScopes.Any()
            ? request.RequestedScopes
            : new[] { "openid", "profile", "email" };

        // Используем переданный refreshToken (ReferenceId) для последующего отзыва
        return new CreateClaimsPrincipalResult
        {
            Success = true,
            Subject = user.Id.ToString(),
            Email = user.Email,
            UserName = user.UserName,
            PreferredUsername = user.UserName,
            Scopes = scopes,
            TokenId = request.RefreshToken // Используем ReferenceId для поиска токена при отзыве
        };
    }
}
