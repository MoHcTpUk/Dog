using System.Security.Claims;
using BCrypt.Net;
using Identity.Domain.Aggregates;
using Identity.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using OpenIddict.Abstractions;

namespace Identity.Application.Services;

public class IdentityService(
    IApplicationUserRepository userRepository,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<IdentityService> logger) : IIdentityService
{
    public async Task<string> CreateUserAsync(string email, string userName, string password, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email {email} already exists");
        }

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

    public async Task<ApplicationUser?> ValidateUserAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        return user;
    }

    public async Task<string?> GenerateTokenAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        // Вызываем Identity API для получения токена
        var identityApiUrl = configuration["Identity:ApiUrl"] ?? "http://identity:8080";
        var clientId = configuration["Identity:ClientId"] ?? "dog-app";
        var clientSecret = configuration["Identity:ClientSecret"] ?? string.Empty;

        try
        {
            var httpClient = httpClientFactory.CreateClient();
            var tokenRequest = new
            {
                grant_type = "password",
                username = email,
                password = password,
                client_id = clientId,
                scope = "openid profile email"
            };

            var response = await httpClient.PostAsJsonAsync($"{identityApiUrl}/connect/token", tokenRequest, cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: cancellationToken);
                return tokenResponse?.AccessToken;
            }

            logger.LogWarning("Failed to get token from Identity API. Status: {Status}", response.StatusCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating token for user {Email}", email);
            return null;
        }
    }

    public async Task<ApplicationUser?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await userRepository.GetAsync(userId, cancellationToken);
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
        if (scopes.Any())
        {
            claimsPrincipal.SetScopes(scopes);
        }

        return claimsPrincipal;
    }

    private class TokenResponse
    {
        public string? AccessToken { get; set; }
        public string? TokenType { get; set; }
        public int ExpiresIn { get; set; }
    }
}
