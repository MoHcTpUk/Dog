using System.Security.Claims;
using Identity.Domain.Aggregates;
using Identity.Infrastructure.Repositories;
using OpenIddict.Abstractions;

namespace Identity.Application.Services;

public class IdentityService(
    IApplicationUserRepository userRepository) : IIdentityService
{
    public async Task<ApplicationUser?> ValidateUserAsync(string email, string password,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null) return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;

        return user;
    }

    public ClaimsPrincipal CreateClaimsPrincipal(ApplicationUser user, IEnumerable<string> scopes)
    {
        var identity = new ClaimsIdentity(
            "Bearer",
            OpenIddictConstants.Claims.Name,
            OpenIddictConstants.Claims.Role);

        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Subject, user.Id.ToString()));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Email, user.Email));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.Name, user.UserName ?? string.Empty));
        identity.AddClaim(new Claim(OpenIddictConstants.Claims.PreferredUsername, user.UserName ?? string.Empty));

        var claimsPrincipal = new ClaimsPrincipal(identity);

        if (scopes.Any()) claimsPrincipal.SetScopes(scopes);

        return claimsPrincipal;
    }
}