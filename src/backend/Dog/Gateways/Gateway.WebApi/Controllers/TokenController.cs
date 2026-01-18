using System.Security.Claims;
using Identity.Api.Commands;
using Identity.Api.Services;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("connect")]
public class TokenController : ControllerBase
{
    private readonly IOpenIddictTokenManager _tokenManager;
    private readonly ITokenService _tokenService;

    public TokenController(
        ITokenService tokenService,
        IOpenIddictTokenManager tokenManager)
    {
        _tokenService = tokenService;
        _tokenManager = tokenManager;
    }

    [HttpPost("token")]
    [Produces("application/json")]
    public async Task<IActionResult> Exchange()
    {
        var request = HttpContext.GetOpenIddictServerRequest();
        if (request == null)
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidRequest
            });

        if (request.IsPasswordGrantType()) return await HandlePasswordGrant(request);

        if (request.IsRefreshTokenGrantType()) return await HandleRefreshTokenGrant(request);

        return BadRequest(new OpenIddictResponse
        {
            Error = OpenIddictConstants.Errors.UnsupportedGrantType
        });
    }

    private async Task<IActionResult> HandlePasswordGrant(OpenIddictRequest request)
    {
        var username = request.Username;
        var password = request.Password;

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = "Username and password are required"
            });

        var command = new CreateClaimsPrincipalForPasswordGrantCommand
        {
            Username = username,
            Password = password,
            Scopes = request.GetScopes()
        };

        var result = await _tokenService.CreateClaimsPrincipalForPasswordGrantAsync(command);

        if (!result.Success || string.IsNullOrEmpty(result.Subject))
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = result.ErrorMessage ?? "Invalid username or password"
            });

        var claimsPrincipal = CreateClaimsPrincipalFromResult(result);

        return SignIn(claimsPrincipal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IActionResult> HandleRefreshTokenGrant(OpenIddictRequest request)
    {
        var refreshToken = request.RefreshToken;
        if (string.IsNullOrEmpty(refreshToken))
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = "Refresh token is required"
            });

        var command = new CreateClaimsPrincipalForRefreshTokenCommand
        {
            RefreshToken = refreshToken,
            RequestedScopes = request.GetScopes()
        };

        var result = await _tokenService.CreateClaimsPrincipalForRefreshTokenAsync(command);

        if (!result.Success || string.IsNullOrEmpty(result.Subject))
        {
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = result.ErrorMessage ?? "Invalid refresh token"
            });
        }

        // Отзываем старый refresh token, если есть TokenId (ReferenceId)
        if (!string.IsNullOrEmpty(result.TokenId))
        {
            var token = await _tokenManager.FindByReferenceIdAsync(result.TokenId, CancellationToken.None);
            if (token != null)
            {
                await _tokenManager.TryRevokeAsync(token, CancellationToken.None);
            }
        }

        var claimsPrincipal = CreateClaimsPrincipalFromResult(result);

        // Возвращаем новый access token и refresh token через SignIn
        // OpenIddict автоматически создаст новый refresh token и добавит его в ответ
        return SignIn(claimsPrincipal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private ClaimsPrincipal CreateClaimsPrincipalFromResult(CreateClaimsPrincipalResult result)
    {
        var identity = new ClaimsIdentity(
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Subject, result.Subject!));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Email, result.Email ?? string.Empty));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Name, result.UserName ?? string.Empty));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.PreferredUsername, result.PreferredUsername ?? string.Empty));

        var claimsPrincipal = new ClaimsPrincipal(identity);
        claimsPrincipal.SetScopes(result.Scopes);
        claimsPrincipal.SetResources(result.Scopes);

        return claimsPrincipal;
    }
}