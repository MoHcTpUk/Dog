using System.Security.Claims;
using Identity.Application.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Identity.WebApi.Controllers;

[ApiController]
[Route("connect")]
public class TokenController(
    IIdentityService identityService)
    : ControllerBase
{
    [HttpPost("token")]
    [AllowAnonymous]
    [Produces("application/json")]
    // Пример получения токена по паролю (обязательно запросить offline_access, чтобы получить refresh_token):
    // curl -X POST "https://localhost:5001/connect/token" ^
    //   -H "Content-Type: application/x-www-form-urlencoded" ^
    //   -d "grant_type=password&client_id=dog-app&username=user%40mail.com&password=Passw0rd!&scope=openid%20profile%20email%20offline_access"
    //
    // Пример обновления (refresh):
    // curl -X POST "https://localhost:5001/connect/token" ^
    //   -H "Content-Type: application/x-www-form-urlencoded" ^
    //   -d "grant_type=refresh_token&client_id=dog-app&refresh_token=REFRESH_TOKEN_VALUE"
    public async Task<IActionResult> Exchange(CancellationToken cancellationToken)
    {
        // В token endpoint passthrough OpenIddict сам парсит запрос (из form/json/etc.) и кладёт его в HttpContext.
        // Поэтому не полагаемся на Request.Form/[FromForm], которые могут быть уже прочитаны middleware.
        var request = HttpContext.Features.Get<OpenIddictServerAspNetCoreFeature>()?.Transaction?.Request
                      ?? throw new InvalidOperationException("The OpenIddict request cannot be retrieved.");

        if (request.IsPasswordGrantType())
        {
            var user = await identityService.ValidateUserAsync(
                request.Username ?? string.Empty,
                request.Password ?? string.Empty,
                cancellationToken);
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

            foreach (var claim in principal.Claims) claim.SetDestinations(GetDestinations(claim, principal));

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        if (request.IsRefreshTokenGrantType())
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

            // Доп. валидация: пользователь должен всё ещё существовать.
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

            // В refresh-запросе scopes обычно не передают: берём те, что были выданы ранее.
            var scopes = principal.GetScopes();
            principal = identityService.CreateClaimsPrincipal(user, scopes);
            principal.SetScopes(scopes);

            foreach (var claim in principal.Claims) claim.SetDestinations(GetDestinations(claim, principal));

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

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