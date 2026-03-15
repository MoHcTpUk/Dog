using System.Security.Claims;
using Identity.Application.Services;
using Identity.Domain.Aggregates;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Identity.WebApi.Controllers;

[ApiController]
[Route("connect")]
public class TokenController(
    IIdentityService identityService)
    : ControllerBase
{
    private const string OAuthErrorUri = "https://datatracker.ietf.org/doc/html/rfc6749#section-5.2";

    [HttpPost("token")]
    [AllowAnonymous]
    [Produces("application/json")]

    public async Task<IActionResult> Exchange(CancellationToken cancellationToken)
    {
        try
        {
            var request = HttpContext.Features.Get<OpenIddictServerAspNetCoreFeature>()?.Transaction?.Request
                          ?? throw new InvalidOperationException("The OpenIddict request cannot be retrieved.");

            if (request.IsPasswordGrantType())
                return await ExchangePasswordAsync(request, cancellationToken);

            if (request.IsRefreshTokenGrantType())
                return await ExchangeRefreshTokenAsync(cancellationToken);

            return Forbid(
                new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] =
                        OpenIddictConstants.Errors.UnsupportedGrantType,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                        "The specified grant type is not supported."
                }),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }
        catch (InvalidOperationException e)
        {
            return OAuthErrorResult(
                StatusCodes.Status400BadRequest,
                OpenIddictConstants.Errors.InvalidRequest,
                e.Message);
        }
        catch (Exception e)
        {
            return OAuthErrorResult(
                StatusCodes.Status500InternalServerError,
                OpenIddictConstants.Errors.ServerError,
                e.Message);
        }
    }

    private async Task<IActionResult> ExchangePasswordAsync(OpenIddictRequest request, CancellationToken cancellationToken)
    {
        ApplicationUser? user;
        if (HttpContext.Items.TryGetValue("VerifiedAuthUserEmail", out var verifiedAuthUserEmailObj) &&
            verifiedAuthUserEmailObj is string verifiedAuthUserEmail &&
            string.Equals(verifiedAuthUserEmail, request.Username, StringComparison.OrdinalIgnoreCase))
        {
            user = await identityService.GetUserByEmailAsync(verifiedAuthUserEmail, cancellationToken);
        }
        else
        {
            user = await identityService.ValidateUserAsync(
                request.Username ?? string.Empty,
                request.Password ?? string.Empty,
                cancellationToken);
        }

        if (user is null)
        {
            return Forbid(
                new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid username/password."
                }),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var principal = identityService.CreateClaimsPrincipal(user, request.GetScopes());
        principal.SetScopes(request.GetScopes());
        principal.SetResources("dog-app", "gateway-webapi");

        foreach (var claim in principal.Claims) claim.SetDestinations(GetDestinations(claim, principal));

        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IActionResult> ExchangeRefreshTokenAsync(CancellationToken cancellationToken)
    {
        var authenticateResult =
            await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

        var principal = authenticateResult.Principal;
        if (principal is null)
        {
            return Forbid(
                new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid refresh token."
                }),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var subject = principal.GetClaim(OpenIddictConstants.Claims.Subject);
        if (!Guid.TryParse(subject, out var userId))
        {
            return Forbid(
                new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid refresh token subject."
                }),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var user = await identityService.GetUserByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Forbid(
                new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The refresh token is no longer valid."
                }),
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var scopes = principal.GetScopes();
        principal = identityService.CreateClaimsPrincipal(user, scopes);
        principal.SetScopes(scopes);
        principal.SetResources("dog-app", "gateway-webapi");

        foreach (var claim in principal.Claims) claim.SetDestinations(GetDestinations(claim, principal));

        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private ObjectResult OAuthErrorResult(int statusCode, string error, string description)
    {
        var payload = new
        {
            error,
            error_description = description,
            error_uri = OAuthErrorUri
        };

        return new ObjectResult(payload)
        {
            StatusCode = statusCode,
            ContentTypes = { "application/json" }
        };
    }

    private static IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    {
        switch (claim.Type)
        {
            case OpenIddictConstants.Claims.Subject:
                yield return OpenIddictConstants.Destinations.AccessToken;
                yield return OpenIddictConstants.Destinations.IdentityToken;
                yield break;

            case OpenIddictConstants.Claims.Name:
            case OpenIddictConstants.Claims.PreferredUsername:
                yield return OpenIddictConstants.Destinations.AccessToken;
                if (principal.HasScope(OpenIddictConstants.Scopes.Profile))
                    yield return OpenIddictConstants.Destinations.IdentityToken;
                yield break;

            case OpenIddictConstants.Claims.Email:
                yield return OpenIddictConstants.Destinations.AccessToken;
                if (principal.HasScope(OpenIddictConstants.Scopes.Email))
                    yield return OpenIddictConstants.Destinations.IdentityToken;
                yield break;

            case OpenIddictConstants.Claims.Role:
                yield return OpenIddictConstants.Destinations.AccessToken;
                if (principal.HasScope(OpenIddictConstants.Scopes.Roles))
                    yield return OpenIddictConstants.Destinations.IdentityToken;
                yield break;

            default:
                yield return OpenIddictConstants.Destinations.AccessToken;
                yield break;
        }
    }
}