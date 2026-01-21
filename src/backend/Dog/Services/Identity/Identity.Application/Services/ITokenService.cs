using System.Security.Claims;

namespace Identity.Application.Services;

public interface ITokenService
{
    Task<string?> GenerateTokenAsync(ClaimsPrincipal principal, IEnumerable<string> scopes, CancellationToken cancellationToken);
}
