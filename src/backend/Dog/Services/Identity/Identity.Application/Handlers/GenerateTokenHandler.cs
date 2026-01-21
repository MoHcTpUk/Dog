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
        var user = await identityService.ValidateUserAsync(request.Email, request.Password, cancellationToken);

        var scopes = request.Scope.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var claimsPrincipal = identityService.CreateClaimsPrincipal(user, scopes);

        var identity = new ClaimsIdentity(
            claimsPrincipal.Claims,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        claimsPrincipal = new ClaimsPrincipal(identity);
        claimsPrincipal.SetScopes(scopes);
        claimsPrincipal.SetResources(scopes);

        var accessToken = await tokenService.GenerateTokenAsync(claimsPrincipal);

        return new GenerateTokenResult
        {
            Success = true,
            AccessToken = accessToken,
            RefreshToken = string.Empty,
            TokenType = "Bearer",
            ExpiresIn = 86400
        };
    }
}