using System.Security.Claims;
using Identity.Application.Interfaces;
using Identity.Domain.Aggregates;
using OpenIddict.Abstractions;

namespace Identity.Application.Services;

public class IdentityService(
    IApplicationUserRepository userRepository) : IIdentityService
{
    public async Task<string> CreateUserAsync(string email, string userName, string password,
        CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser != null) throw new InvalidOperationException($"User with email {email} already exists");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        var newUser = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = userName,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        return newUser.Id.ToString();
    }

    public async Task<ApplicationUser?> ValidateUserAsync(string email, string password,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null) return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;

        return user;
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await userRepository.GetAsync(id, cancellationToken);
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

        // Устанавливаем scopes через extension method OpenIddict
        if (scopes.Any()) claimsPrincipal.SetScopes(scopes);

        return claimsPrincipal;
    }
}