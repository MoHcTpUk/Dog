using Shared.Infrastructure.Repository;
using Identity.Domain.Aggregates;

namespace Identity.Infrastructure.Repositories;

public interface IApplicationUserRepository : IRepository<ApplicationUser>
{
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<ApplicationUser?> GetByUserNameAsync(string userName, CancellationToken cancellationToken);
}
