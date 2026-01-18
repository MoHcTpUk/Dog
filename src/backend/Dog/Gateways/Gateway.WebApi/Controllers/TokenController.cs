using System.Security.Claims;
using Identity.Application.Services;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("connect")]
public class TokenController : ControllerBase
{
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IIdentityService _identityService;

    public TokenController(
        IIdentityService identityService,
        IOpenIddictApplicationManager applicationManager)
    {
        _identityService = identityService;
        _applicationManager = applicationManager;
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

        // Проверяем учетные данные через IdentityService
        var user = await _identityService.ValidateUserAsync(username, password, CancellationToken.None);
        if (user == null)
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = "Invalid username or password"
            });

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

        claimsPrincipal.SetScopes(request.GetScopes());
        claimsPrincipal.SetResources(await GetResourcesAsync(request.GetScopes()));

        return SignIn(claimsPrincipal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IActionResult> HandleRefreshTokenGrant(OpenIddictRequest request)
    {
        var result = await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        var claimsPrincipal = result.Principal;

        if (claimsPrincipal == null)
            return BadRequest(new OpenIddictResponse
            {
                Error = OpenIddictConstants.Errors.InvalidGrant,
                ErrorDescription = "Invalid refresh token"
            });

        var identity = new ClaimsIdentity(claimsPrincipal.Claims,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        var newClaimsPrincipal = new ClaimsPrincipal(identity);

        newClaimsPrincipal.SetScopes(request.GetScopes());
        newClaimsPrincipal.SetResources(await GetResourcesAsync(request.GetScopes()));

        return SignIn(newClaimsPrincipal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IEnumerable<string>> GetResourcesAsync(IEnumerable<string> scopes)
    {
        // Возвращаем ресурсы на основе scopes
        return scopes;
    }
}