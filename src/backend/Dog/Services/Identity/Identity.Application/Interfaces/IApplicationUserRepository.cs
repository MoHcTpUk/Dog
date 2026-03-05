using Identity.Domain.Aggregates;
using Shared.Domain.Interfaces;

namespace Identity.Application.Interfaces;

public interface IApplicationUserRepository : IRepository<ApplicationUser>
{
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<ApplicationUser?> GetByUserNameAsync(string userName, CancellationToken cancellationToken);
}