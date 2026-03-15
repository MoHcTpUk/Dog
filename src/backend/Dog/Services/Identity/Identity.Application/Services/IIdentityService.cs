using System.Security.Claims;
using Identity.Domain.Aggregates;

namespace Identity.Application.Services;

public interface IIdentityService
{
    Task<Guid> CreateUserAsync(string email, string userName, string password, CancellationToken cancellationToken);
    Task SetUserPasswordAsync(string email, string password, CancellationToken cancellationToken);
    Task<ApplicationUser?> ValidateUserAsync(string email, string password, CancellationToken cancellationToken);
    Task<ApplicationUser?> GetUserByEmailAsync(string email, CancellationToken cancellationToken);
    Task<ApplicationUser?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken);
    ClaimsPrincipal CreateClaimsPrincipal(ApplicationUser user, IEnumerable<string> scopes);
}
