using System.Security.Claims;

namespace Identity.Application.Services;

public interface ITokenService
{
    Task<string?> GenerateTokenAsync(ClaimsPrincipal principal, IEnumerable<string> scopes, CancellationToken cancellationToken);
    Task<ClaimsPrincipal?> CreateClaimsPrincipalForPasswordGrantAsync(string username, string password, IEnumerable<string> scopes, CancellationToken cancellationToken);
    Task<(ClaimsPrincipal? Principal, object? Token)> CreateClaimsPrincipalForRefreshTokenAsync(string refreshToken, IEnumerable<string> requestedScopes, CancellationToken cancellationToken);
    Task<IEnumerable<string>> GetResourcesAsync(IEnumerable<string> scopes);
}
