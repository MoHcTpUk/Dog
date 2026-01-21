using System.Security.Claims;
using Identity.Domain.Aggregates;

namespace Identity.Application.Services;

public interface IIdentityService
{
    Task<ApplicationUser?> ValidateUserAsync(string email, string password, CancellationToken cancellationToken);
    ClaimsPrincipal CreateClaimsPrincipal(ApplicationUser user, IEnumerable<string> scopes);
}