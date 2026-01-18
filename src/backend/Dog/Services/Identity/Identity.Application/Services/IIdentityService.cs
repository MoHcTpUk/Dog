using Identity.Domain.Aggregates;

namespace Identity.Application.Services;

public interface IIdentityService
{
    Task<string> CreateUserAsync(string email, string userName, string password, CancellationToken cancellationToken);
    Task<string?> GenerateTokenAsync(string email, string password, CancellationToken cancellationToken);
    Task<ApplicationUser?> ValidateUserAsync(string email, string password, CancellationToken cancellationToken);
}
